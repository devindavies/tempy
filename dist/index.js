import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import tempDir from "temp-dir";
import { randomBytes } from "node:crypto";
import { Readable } from "node:stream";
const getPath = (prefix = "") => path.join(tempDir, prefix + randomBytes(64).toString("hex"));
const writeStream = async (filePath, data) => pipeline(data, fs.createWriteStream(filePath));
async function runTask(temporaryPath, callback) {
    try {
        return await callback(temporaryPath);
    }
    finally {
        await fsPromises.rm(temporaryPath, {
            recursive: true,
            force: true,
            maxRetries: 2,
        });
    }
}
export function temporaryFile({ name, extension } = {}) {
    if (name) {
        if (extension !== undefined && extension !== null) {
            throw new Error("The `name` and `extension` options are mutually exclusive");
        }
        return path.join(temporaryDirectory(), name);
    }
    return (getPath() +
        (extension === undefined || extension === null
            ? ""
            : `.${extension.replace(/^\./, "")}`));
}
export const temporaryFileTask = async (callback, options) => runTask(temporaryFile(options), callback);
export function temporaryDirectory({ prefix = "" } = {}) {
    const directory = getPath(prefix);
    fs.mkdirSync(directory);
    return directory;
}
export const temporaryDirectoryTask = async (callback, options) => runTask(temporaryDirectory(options), callback);
export async function temporaryWrite(fileContent, options) {
    const filename = temporaryFile(options);
    fileContent instanceof Readable
        ? await writeStream(filename, fileContent)
        : await fsPromises.writeFile(filename, fileContent);
    return filename;
}
export const temporaryWriteTask = async (fileContent, callback, options) => runTask(await temporaryWrite(fileContent, options), callback);
export function temporaryWriteSync(fileContent, options) {
    const filename = temporaryFile(options);
    fs.writeFileSync(filename, fileContent);
    return filename;
}
export { default as rootTemporaryDirectory } from "temp-dir";
