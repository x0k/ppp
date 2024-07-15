import { ThreadStatus } from './enums';
/**
 * Generic interface for a thread.
 */
export interface Thread {
    getStatus(): ThreadStatus;
    isDaemon(): boolean;
    getPriority(): number;
    setStatus(status: ThreadStatus): void;
    run(): void;
}
/**
 * Implements a thread scheduling algorithm
 */
export interface Scheduler<T extends Thread> {
    /**
     * Schedule the given thread to run.
     */
    scheduleThread(thread: T): void;
    /**
     * Signal that the given thread's priority has changed.
     */
    priorityChange(thread: T): void;
    /**
     * Unschedule the given thread to run. It is removed from
     * the scheduler's queue.
     */
    unscheduleThread(thread: T): void;
    /**
     * Retrieve the currently running thread. Returns NULL if
     * no threads are running.
     */
    getRunningThread(): T;
    /**
     * Called when a thread's quantum is over.
     */
    quantumOver(thread: T): void;
}
/**
 * Represents a thread pool. Handles scheduling duties.
 */
export default class ThreadPool<T extends Thread> {
    private threads;
    private runningThread;
    private scheduler;
    /**
     * Called when the ThreadPool becomes empty. This is usually a sign that
     * execution has finished.
     *
     * If the callback returns true it signals that this threadpool can free its resources.
     */
    private emptyCallback;
    constructor(emptyCallback: () => boolean);
    /**
     * Retrieve all of the threads in the thread pool.
     */
    getThreads(): T[];
    /**
     * Checks if any remaining threads are non-daemonic and could be runnable.
     * If not, we can terminate execution.
     *
     * This check is invoked each time a thread terminates.
     */
    private anyNonDaemonicThreads();
    private threadTerminated(thread);
    /**
     * Called when a thread's status changes.
     */
    statusChange(thread: T, oldStatus: ThreadStatus, newStatus: ThreadStatus): void;
    /**
     * Called when a thread's priority changes.
     */
    priorityChange(thread: T): void;
    /**
     * Called when a thread's quantum is over.
     */
    quantumOver(thread: T): void;
}
