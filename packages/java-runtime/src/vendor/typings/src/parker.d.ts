import { JVMThread } from './threading';
/**
 * Manages parked threads and their callbacks.
 */
export default class Parker {
    private _parkCounts;
    private _parkCallbacks;
    park(thread: JVMThread, cb: () => void): void;
    unpark(thread: JVMThread): void;
    completelyUnpark(thread: JVMThread): void;
    private _mutateParkCount(thread, delta);
    isParked(thread: JVMThread): boolean;
}
