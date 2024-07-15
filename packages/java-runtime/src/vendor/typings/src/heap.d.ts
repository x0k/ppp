/// <reference types="node" />
export default class Heap {
    private size;
    constructor(size: number);
    malloc(size: number): number;
    free(addr: number): void;
    store_word(addr: number, value: number): void;
    get_byte(addr: number): number;
    get_word(addr: number): number;
    get_buffer(addr: number, len: number): Buffer;
    get_signed_byte(addr: number): number;
    set_byte(addr: number, value: number): void;
    set_signed_byte(addr: number, value: number): void;
    /**
     * Copy len bytes from srcAddr to dstAddr.
     */
    memcpy(srcAddr: number, dstAddr: number, len: number): void;
    private refill(cl);
    private static ilog2(num);
    private static size_to_class(size);
    private cl_to_size(cl);
    private _buffer;
    private _remaining;
    private _offset;
    private static _numSizeClasses;
    private static _chunkSize;
    private _freeLists;
    private _sizeMap;
}
