import { JVMThread } from './threading';
import { ClassData } from './ClassData';
/**
 * A single class lock, used for load/initialization locks.
 */
export default class ClassLock {
    private queue;
    /**
     * Checks if the lock is taken. If so, it enqueues the callback. Otherwise,
     * it takes the lock and returns true.
     */
    tryLock(thread: JVMThread, cb: (cdata: ClassData) => void): boolean;
    /**
     * Releases the lock on the class, and passes the object to all enqueued
     * callbacks.
     */
    unlock(cdata: ClassData): void;
    /**
     * Get the owner of this lock.
     */
    getOwner(): JVMThread;
}
