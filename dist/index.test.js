import { describe, expect, test } from "vitest";
import { Buffer } from "node:buffer";
import path from "node:path";
import fs from "node:fs";
import stream from "node:stream";
import tempDir from "temp-dir";
import { pathExists } from "path-exists";
import touch from "touch";
import { temporaryFile, temporaryFileTask, temporaryDirectory, temporaryDirectoryTask, temporaryWrite, temporaryWriteTask, temporaryWriteSync, rootTemporaryDirectory, } from "./index.js";
describe.concurrent("tempy", () => {
    test("default", () => {
        expect(temporaryFile()).toContain(tempDir);
    });
    test.for([
        { name: "default", options: undefined, ending: ".png", expected: false },
        {
            name: "extension undefined",
            options: { extension: undefined },
            ending: ".",
            expected: false,
        },
        {
            name: "extension null",
            options: { extension: null },
            ending: ".",
            expected: false,
        },
        {
            name: "extension",
            options: { extension: "png" },
            ending: ".png",
            expected: true,
        },
        {
            name: "extension with dot",
            options: { extension: ".png" },
            ending: ".png",
            expected: true,
        },
        {
            name: "extension with double dot",
            options: { extension: ".png" },
            ending: "..png",
            expected: false,
        },
        {
            name: "name",
            options: { name: "custom-name.md" },
            ending: "custom-name.md",
            expected: true,
        },
    ])("$name", ({ options, ending, expected }) => {
        expect(temporaryFile(options).endsWith(ending)).toBe(expected);
    });
    test("name with extension", () => {
        expect(() => {
            temporaryFile({ name: "custom-name.md", extension: ".ext" });
        }).toThrow();
    });
    test("name with empty extension", () => {
        expect(() => {
            temporaryFile({
                name: "custom-name.md",
                extension: "",
            });
        }).toThrow();
    });
    test("name with undefined extension", () => {
        expect(() => {
            temporaryFile({
                name: "custom-name.md",
                extension: undefined,
            });
        }).not.toThrow();
    });
    test("name with null extension", () => {
        expect(() => {
            temporaryFile({
                name: "custom-name.md",
                extension: null,
            });
        }).not.toThrow();
    });
    test(".file.task()", async () => {
        let temporaryFilePath = "";
        expect(await temporaryFileTask(async (temporaryFile) => {
            await touch(temporaryFile);
            temporaryFilePath = temporaryFile;
            return temporaryFile;
        })).toBe(temporaryFilePath);
        expect(await pathExists(temporaryFilePath)).toBe(false);
    });
    test(".task() - cleans up even if callback throws", async () => {
        let temporaryDirectoryPath = "";
        await expect(temporaryDirectoryTask(async (temporaryDirectory) => {
            temporaryDirectoryPath = temporaryDirectory;
            throw new Error("Catch me if you can!");
        })).rejects.toThrow("Catch me if you can!");
        expect(await pathExists(temporaryDirectoryPath)).toBe(false);
    });
    test(".directory()", () => {
        const prefix = "name_";
        expect(temporaryDirectory()).toContain(tempDir);
        expect(path.basename(temporaryDirectory({ prefix })).startsWith(prefix)).toBe(true);
    });
    test(".directory.task()", async () => {
        let temporaryDirectoryPath = "";
        expect(await temporaryDirectoryTask(async (temporaryDirectory) => {
            temporaryDirectoryPath = temporaryDirectory;
            return temporaryDirectory;
        })).toBe(temporaryDirectoryPath);
        expect(await pathExists(temporaryDirectoryPath)).toBe(false);
    });
    test(".write(string)", async () => {
        const filePath = await temporaryWrite("unicorn", { name: "test.png" });
        expect(fs.readFileSync(filePath, "utf8")).toBe("unicorn");
        expect(path.basename(filePath)).toBe("test.png");
    });
    test(".write.task(string)", async () => {
        let temporaryFilePath = "";
        expect(await temporaryWriteTask("", async (temporaryFile) => {
            temporaryFilePath = temporaryFile;
            return temporaryFile;
        })).toBe(temporaryFilePath);
        expect(await pathExists(temporaryFilePath)).toBe(false);
    });
    test(".write(buffer)", async () => {
        const filePath = await temporaryWrite(Buffer.from("unicorn"));
        expect(fs.readFileSync(filePath, "utf8")).toBe("unicorn");
    });
    test(".write(stream)", async () => {
        const readable = new stream.Readable({
            read() { },
        });
        readable.push("unicorn");
        readable.push(null);
        const filePath = await temporaryWrite(readable);
        expect(fs.readFileSync(filePath, "utf8")).toBe("unicorn");
    });
    test(".write(stream) failing stream", async () => {
        const readable = new stream.Readable({
            read() { },
        });
        readable.push("unicorn");
        setImmediate(() => {
            readable.emit("error", new Error("Catch me if you can!"));
            readable.push(null);
        });
        await expect(temporaryWrite(readable)).rejects.toThrow("Catch me if you can!");
    });
    test(".writeSync()", () => {
        expect(fs.readFileSync(temporaryWriteSync("unicorn"), "utf8")).toBe("unicorn");
    });
    test(".root", () => {
        expect(rootTemporaryDirectory.length).toBeGreaterThan(0);
        expect(path.isAbsolute(rootTemporaryDirectory)).toBe(true);
    });
});
