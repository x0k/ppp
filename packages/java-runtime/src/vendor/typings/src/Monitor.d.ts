import { JVMThread } from './threading';
/**
 * Represents a JVM monitor.
 */
export default class Monitor {
    /**
     * The owner of the monitor.
     */
    private owner;
    /**
     * Number of times that the current owner has locked this monitor.
     */
    private count;
    /**
     * JVM threads that are waiting for the current owner to relinquish the
     * monitor.
     */
    private blocked;
    /**
     * Queue of JVM threads that are waiting for a JVM thread to notify them.
     */
    private waiting;
    /**
     * Attempts to acquire the monitor.
     *
     * Thread transitions:
     * * RUNNABLE => BLOCKED [If fails to acquire lock]
     *
     * @param thread The thread that is trying to acquire the monitor.
     * @param cb If this method returns false, then this callback will be
     *   triggered once the thread becomes owner of the monitor. At that time,
     *   the thread will be in the RUNNABLE state.
     * @return True if successfull, false if not. If not successful, the thread
     *   becomes BLOCKED, and the input callback will be triggered once the
     *   thread owns the monitor and is RUNNABLE.
     */
    enter(thread: JVMThread, cb: () => void): boolean;
    /**
     * Generic version of Monitor.enter for contending for the lock.
     *
     * Thread transitions:
     * * RUNNABLE => UNINTERRUPTIBLY_BLOCKED [If fails to acquire lock]
     * * RUNNABLE => BLOCKED [If fails to acquire lock]
     *
     * @param thread The thread contending for the lock.
     * @param count The lock count to use once the thread owns the lock.
     * @param blockStatus The ThreadStatus to use should the thread need to
     *   contend for the lock (either BLOCKED or UNINTERRUPTIBLY_BLOCKED).
     * @param cb The callback to call once the thread becomes owner of the lock.
     * @return True if the thread immediately acquired the lock, false if the
     *   thread is now blocked on the lock.
     */
    private contendForLock(thread, count, blockStatus, cb);
    /**
     * Exits the monitor. Handles notifying the waiting threads if the lock
     * becomes available.
     *
     * Thread transitions:
     * * *NONE* on the argument thread.
     * * A *BLOCKED* thread may be scheduled if the owner gives up the monitor.
     *
     * @param thread The thread that is exiting the monitor.
     * @return True if exit succeeded, false if an exception occurred.
     */
    exit(thread: JVMThread): boolean;
    /**
     * Chooses one of the blocked threads to become the monitor's owner.
     */
    private appointNewOwner();
    /**
     * "Causes the current thread to wait until another thread invokes the
     *  notify() method or the notifyAll() method for this object, or some other
     *  thread interrupts the current thread, or a certain amount of real time
     *  has elapsed.
     *
     *  This method causes the current thread (call it T) to place itself in the
     *  wait set for this object and then to relinquish any and all
     *  synchronization claims on this object."
     *
     * We coalesce all possible wait configurations into this one function.
     * @from http://docs.oracle.com/javase/7/docs/api/java/lang/Object.html#wait(long, int)
     * @param thread The thread that wants to wait on this monitor.
     * @param cb The callback triggered once the thread wakes up.
     * @param timeoutMs? An optional timeout that specifies how long the thread
     *   should wait, in milliseconds. If this value is 0, then we ignore it.
     * @param timeoutNs? An optional timeout that specifies how long the thread
     *   should wait, in nanosecond precision (currently ignored).
     * @todo Use high-precision timers in browsers that support it.
     * @return True if the wait succeeded, false if it triggered an exception.
     */
    wait(thread: JVMThread, cb: (fromTimer: boolean) => void, timeoutMs?: number, timeoutNs?: number): boolean;
    /**
     * Removes the specified thread from the waiting set, and makes it compete
     * for the monitor lock. Once it acquires the lock, we restore its lock
     * count prior to triggering the wait callback.
     *
     * If the thread is interrupted, the wait callback is *not* triggered.
     *
     * @param thread The thread to remove.
     * @param fromTimer Indicates if this function call was triggered from a
     *   timer event.
     * @param [interrupting] If true, then we are *interrupting* the wait. Do not
     *   trigger the wait callback.
     * @param [unwaitCb] If interrupting is true, then this callback is triggered
     *   once the thread reacquires the lock.
     */
    unwait(thread: JVMThread, fromTimer: boolean, interrupting?: boolean, unwaitCb?: () => void): void;
    /**
     * Removes the specified thread from being blocked on the monitor so it can
     * re-compete for ownership.
     * @param [interrupting] If true, we are interrupting the monitor block. The
     *   thread should not acquire the lock, and the block callback should not
     *   be triggered.
     */
    unblock(thread: JVMThread, interrupting?: boolean): void;
    /**
     * Notifies a single waiting thread.
     * @param thread The notifying thread. *MUST* be the owner.
     */
    notify(thread: JVMThread): void;
    /**
     * Notifies all waiting threads.
     * @param thread The notifying thread. *MUST* be the owner.
     */
    notifyAll(thread: JVMThread): void;
    /**
     * @return The owner of the monitor.
     */
    getOwner(): JVMThread;
    isWaiting(thread: JVMThread): boolean;
    isTimedWaiting(thread: JVMThread): boolean;
    isBlocked(thread: JVMThread): boolean;
}
