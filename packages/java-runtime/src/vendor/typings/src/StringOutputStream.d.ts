/**
 * Utility class. "stream" out string data, and compile into a single string.
 */
export default class StringOutputStream {
    private _data;
    write(data: string): void;
    flush(): string;
}
