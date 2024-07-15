/// <reference types="node" />
import gLong from './gLong';
/**
 * A ByteStream, implemented using a NodeBuffer.
 */
export default class ByteStream {
    private buffer;
    private _index;
    constructor(buffer: NodeBuffer);
    /**
     * Returns the current read index, and increments the index by the indicated
     * amount.
     */
    private incIndex(inc);
    rewind(): void;
    seek(idx: number): void;
    pos(): number;
    skip(bytesCount: number): void;
    hasBytes(): boolean;
    getFloat(): number;
    getDouble(): number;
    getUint(byteCount: number): number;
    getInt(byteCount: number): number;
    getUint8(): number;
    getUint16(): number;
    getUint32(): number;
    getInt8(): number;
    getInt16(): number;
    getInt32(): number;
    getInt64(): gLong;
    read(bytesCount: number): Buffer;
    peek(): number;
    size(): number;
    slice(len: number): ByteStream;
    getBuffer(): NodeBuffer;
}
