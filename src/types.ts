export type FileOptions =
	| {
			/**
	File extension.

	Mutually exclusive with the `name` option.

	_You usually won't need this option. Specify it only when actually needed._
	*/
			readonly extension?: string;
			readonly name?: never;
	  }
	| {
			/**
	Filename.

	Mutually exclusive with the `extension` option.

	_You usually won't need this option. Specify it only when actually needed._
	*/
			readonly name?: string;
			readonly extension?: never;
	  };

export type DirectoryOptions = {
	/**
	Directory prefix.

	_You usually won't need this option. Specify it only when actually needed._

	Useful for testing by making it easier to identify cache directories that are created.
	*/
	readonly prefix?: string;
};

/**
The temporary path created by the function. Can be asynchronous.
*/
export type TaskCallback<ReturnValueType> = (
	temporaryPath: string,
) => Promise<ReturnValueType> | ReturnValueType;
