/// <reference types="node" />
import { ClassLoader, BootstrapClassLoader } from './ClassLoader';
import { Method } from './methods';
import { ThreadStatus, StackFrameType } from './enums';
import gLong from './gLong';
import JVM from './jvm';
import * as JVMTypes from '../includes/JVMTypes';
import Monitor from './Monitor';
import { default as ThreadPool, Thread } from './threadpool';
/**
 * Represents a stack frame.
 */
export interface IStackFrame {
    /**
     * Runs or resumes the method, as configured.
     */
    run: (thread: JVMThread) => void;
    /**
     * Configures the method to resume after a method call.
     * @rv The return value from the method call, if applicable.
     * @rv2 The second return value, which will always be null if applicable.
     */
    scheduleResume: (thread: JVMThread, rv?: any, rv2?: any) => void;
    /**
     * Checks if the method can handle the given exception. If so,
     * configures the stack frame to handle the exception.
     * @return True if the method can handle the exception.
     */
    scheduleException: (thread: JVMThread, e: JVMTypes.java_lang_Throwable) => boolean;
    /**
     * This stack frame's type.
     */
    type: StackFrameType;
    /**
     * Retrieve a stack trace frame from this stack trace. If this stack frame
     * should not be language-visible, return null.
     */
    getStackTraceFrame(): IStackTraceFrame;
    /**
     * Retrieve the classloader for this method.
     */
    getLoader(): ClassLoader;
}
export declare class PreAllocatedStack {
    private store;
    private curr;
    constructor(initialSize: number);
    push(x: any): void;
    pushAll(): void;
    pushWithNull(x: any): void;
    push6(x: any, y: any, z: any, z1: any, z2: any, z3: any): void;
    swap(): void;
    dup(): void;
    dup2(): void;
    dup_x1(): void;
    dup_x2(): void;
    dup2_x1(): void;
    pop(): any;
    pop2(): any;
    bottom(): any;
    top(): any;
    fromTop(n: number): any;
    sliceFromBottom(n: number): any;
    sliceFromTop(n: number): any;
    dropFromTop(n: number): void;
    sliceAndDropFromTop(n: number): any;
    getRaw(): any[];
    clear(): void;
}
/**
 * Represents a stack frame for a bytecode method.
 */
export declare class BytecodeStackFrame implements IStackFrame {
    pc: number;
    locals: any[];
    opStack: PreAllocatedStack;
    returnToThreadLoop: boolean;
    lockedMethodLock: boolean;
    method: Method;
    /**
     * Constructs a bytecode method's stack frame.
     * @param method The bytecode method to run.
     * @param args The arguments to pass to the bytecode method.
     */
    constructor(method: Method, args: any[]);
    run(thread: JVMThread): void;
    scheduleResume(thread: JVMThread, rv?: any, rv2?: any): void;
    /**
     * Checks if this method can handle the specified exception 'e'.
     * Returns true if it can, or if it needs to asynchronously resolve some
     * classes.
     *
     * In the latter case, scheduleException will handle rethrowing the exception
     * in the event that it can't actually handle it.
     */
    scheduleException(thread: JVMThread, e: JVMTypes.java_lang_Throwable): boolean;
    /**
     * Returns the classloader for the stack frame.
     */
    getLoader(): ClassLoader;
    /**
     * Indicates the type of this stack frame.
     */
    type: StackFrameType;
    getStackTraceFrame(): IStackTraceFrame;
}
/**
 * Represents a native method's stack frame.
 */
export declare class NativeStackFrame implements IStackFrame {
    private nativeMethod;
    method: Method;
    private args;
    /**
     * Constructs a native method's stack frame.
     * @param method The native method to run.
     * @param args The arguments to pass to the native method.
     */
    constructor(method: Method, args: any[]);
    /**
     * Calls the native method.
     * NOTE: Should only be called once.
     */
    run(thread: JVMThread): void;
    /**
     * N/A
     */
    scheduleResume(thread: JVMThread, rv?: any, rv2?: any): void;
    /**
     * Not relevant; the first execution block of a native method will never
     * receive an exception.
     */
    scheduleException(thread: JVMThread, e: JVMTypes.java_lang_Throwable): boolean;
    type: StackFrameType;
    getStackTraceFrame(): IStackTraceFrame;
    /**
     * Returns the classloader for the stack frame.
     */
    getLoader(): ClassLoader;
}
/**
 * InternalStackFrames are used by the JVM to launch JVM functions that
 * eventually call back into JavaScript code when they complete or throw a
 * fatal exception.
 */
export declare class InternalStackFrame implements IStackFrame {
    private isException;
    private val;
    private cb;
    /**
     * @param cb Callback function. Called with an exception if one occurs, or
     *   the return value from the called method, if relevant.
     */
    constructor(cb: (e?: JVMTypes.java_lang_Throwable, rv?: any) => void);
    run(thread: JVMThread): void;
    /**
     * Resumes the JavaScript code that created this stack frame.
     */
    scheduleResume(thread: JVMThread, rv?: any): void;
    /**
     * Resumes the JavaScript code that created this stack frame with the given
     * exception.
     */
    scheduleException(thread: JVMThread, e: JVMTypes.java_lang_Throwable): boolean;
    type: StackFrameType;
    getStackTraceFrame(): IStackTraceFrame;
    getLoader(): ClassLoader;
}
export interface IStackTraceFrame {
    method: Method;
    pc: number;
    stack: any[];
    locals: any[];
}
/**
 * Represents a single JVM thread.
 */
export declare class JVMThread implements Thread {
    /**
     * The current state of this thread, from the JVM level.
     */
    private status;
    /**
     * The call stack.
     */
    private stack;
    /**
     * Whether or not this thread has been interrupted. It's a JVM thing.
     */
    private interrupted;
    /**
     * If the thread is WAITING, BLOCKED, or TIMED_WAITING, this field holds the
     * monitor that is involved.
     */
    private monitor;
    private bsCl;
    private tpool;
    private jvmThreadObj;
    private jvm;
    /**
     * Initializes a new JVM thread. Starts the thread in the NEW state.
     */
    constructor(jvm: JVM, tpool: ThreadPool<JVMThread>, threadObj: JVMTypes.java_lang_Thread);
    /**
     * Get the JVM thread object that represents this thread.
     */
    getJVMObject(): JVMTypes.java_lang_Thread;
    /**
     * Is this thread a daemon?
     */
    isDaemon(): boolean;
    /**
     * Get the priority of this thread.
     */
    getPriority(): number;
    /**
     * XXX: Used during bootstrapping to set the first thread's Thread object.
     */
    setJVMObject(obj: JVMTypes.java_lang_Thread): void;
    /**
     * Return the reference number for this thread.
     */
    getRef(): number;
    /**
     * Check if this thread's interrupted flag is set.
     */
    isInterrupted(): boolean;
    /**
     * Returns the currently running method. Returns NULL if stack is empty.
     */
    currentMethod(): Method;
    /**
     * Set or unset this thread's interrupted flag.
     */
    setInterrupted(interrupted: boolean): void;
    /**
     * Retrieve the bootstrap classloader.
     */
    getBsCl(): BootstrapClassLoader;
    /**
     * Get the classloader for the current frame.
     */
    getLoader(): ClassLoader;
    /**
     * Imports & initializes the given Java class or classes. Returns the JavaScript
     * object that represents the class -- e.g. contains static methods
     * and fields.
     *
     * If multiple names are specified, it returns an array of class objects.
     *
     * If there is an error resolving or initializing any class, it will
     * throw an exception without invoking your callback.
     */
    import<T>(name: string, cb: (rv?: T) => void, explicit?: boolean): void;
    import<T>(names: string[], cb: (rv?: T) => void, explicit?: boolean): void;
    private _import(name, loader, cb, explicit);
    /**
     * Retrieve the JVM instantiation that this thread belongs to.
     */
    getJVM(): JVM;
    /**
     * Retrieve the thread pool that this thread belongs to.
     */
    getThreadPool(): ThreadPool<JVMThread>;
    /**
     * Retrieves the current stack trace.
     */
    getStackTrace(): IStackTraceFrame[];
    /**
     * [DEBUG] Return a printable string of the thread's current stack trace.
     */
    getPrintableStackTrace(): string;
    /**
     * The thread's main execution loop. Everything starts here!
     *
     * SHOULD ONLY BE INVOKED BY THE SCHEDULER.
     */
    run(): void;
    /**
     * [DEBUG] Performs a sanity check on the thread.
     */
    private sanityCheck();
    /**
     * Should only be called by setStatus.
     * Updates both the JVMThread object and this object.
     */
    private rawSetStatus(newStatus);
    /**
     * Transitions the thread from one state to the next.
     * Contains JVM-specific thread logic.
     */
    setStatus(status: ThreadStatus, monitor?: Monitor): void;
    /**
     * Called when a thread finishes executing.
     */
    private exit();
    /**
     * Called when the priority of the thread changes.
     * Should only be called by java.lang.setPriority0.
     */
    signalPriorityChange(): void;
    /**
     * Get the monitor that this thread is waiting or blocked on.
     */
    getMonitorBlock(): Monitor;
    /**
     * Get the thread's current state.
     */
    getStatus(): ThreadStatus;
    /**
     * Returns from the currently executing method with the given return value.
     * Used by asynchronous native
     *
     * Causes the following state transition:
     * * RUNNING => RUNNABLE
     * * RUNNABLE => RUNNABLE
     * * ASYNC_WAITING => RUNNABLE
     *
     * It is not valid to call this method if the thread is in any other state.
     */
    asyncReturn(): void;
    asyncReturn(rv: number): void;
    asyncReturn(rv: JVMTypes.java_lang_Object): void;
    asyncReturn(rv: number, rv2: any): void;
    asyncReturn(rv: gLong, rv2: any): void;
    /**
     * Pops the top stackframe off of the call stack.
     * WARNING: SHOULD ONLY BE CALLED BY InternalStackFrame.run()!
     */
    framePop(): void;
    /**
     * Throws the given JVM exception. Causes the thread to unwind the stack until
     * it can find a stack frame that can handle the exception.
     *
     * Causes the following state transition:
     * * RUNNING => RUNNABLE
     * * RUNNABLE => RUNNABLE
     * * ASYNC_WAITING => RUNNABLE
     *
     * Or, if the exception is uncaught, one of the following transitions:
     * * RUNNING => TERMINATED
     * * RUNNABLE => TERMINATED
     * * ASYNC_WAITING => TERMINATED
     *
     * It is not valid to call this method if the thread is in any other state.
     */
    throwException(exception: JVMTypes.java_lang_Throwable): void;
    /**
     * Construct a new exception object of the given class with the given message.
     * Convenience function for native JavaScript code.
     * @param clsName Name of the class (e.g. "Ljava/lang/Throwable;")
     * @param msg The message to include with the exception.
     */
    throwNewException<T extends JVMTypes.java_lang_Throwable>(clsName: string, msg: string): void;
    /**
     * Handles an uncaught exception on a thread.
     */
    handleUncaughtException(exception: JVMTypes.java_lang_Throwable): void;
    close(): void;
}
/**
 * [DEBUG] Stores all of the valid thread transitions.
 * @todo Any way to make this smaller?
 * @todo Move into 'debug' module that we NOP out in release builds.
 */
export declare var validTransitions: {
    [oldStatus: number]: {
        [newStatus: number]: string;
    };
};
export declare var OpcodeLayoutPrinters: {
    [layoutAtom: number]: (method: Method, code: NodeBuffer, pc: number) => string;
};
export declare function annotateOpcode(op: number, method: Method, code: NodeBuffer, pc: number): string;
