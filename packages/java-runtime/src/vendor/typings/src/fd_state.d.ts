/**
 * Stores the file position of every open file descriptor in the JVM.
 * Shared globally amongst JVM instances since this state is global.
 * We need to track this data since Node.js does not expose this OS state.
 */
export default class FDState {
    private static _positions;
    static open(fd: number, initialPosition: number): void;
    static getPos(fd: number): number;
    static incrementPos(fd: number, incr: number): void;
    static setPos(fd: number, newPos: number): void;
    static close(fd: number): void;
}
