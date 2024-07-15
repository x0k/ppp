import { ClassData } from './ClassData';
import { BootstrapClassLoader, ClassLoader } from './ClassLoader';
import Heap from './heap';
import { JVMOptions } from './interfaces';
import * as JVMTypes from '../includes/JVMTypes';
import Parker from './parker';
/**
 * Encapsulates a single JVM instance.
 */
declare class JVM {
    private systemProperties;
    private internedStrings;
    private bsCl;
    private threadPool;
    private natives;
    private heap;
    private nativeClasspath;
    private startupTime;
    private terminationCb;
    private firstThread;
    private responsiveness;
    private enableSystemAssertions;
    private enabledAssertions;
    private disabledAssertions;
    private printJITCompilation;
    private systemClassLoader;
    private nextRef;
    private vtraceMethods;
    private dumpCompiledCodeDir;
    private parker;
    private status;
    private exitCode;
    private jitDisabled;
    private dumpJITStats;
    private globalRequire;
    static isReleaseBuild(): boolean;
    private static getNativeMethodModules();
    private static _nativeMethodModules;
    private static _haveAddedBuiltinNativeModules;
    /**
     * Registers a JavaScript module that provides particular native methods with Doppio.
     * All new JVMs constructed will auto-run this module to add its natives.
     */
    static registerNativeModule(mod: () => any): void;
    /**
     * (Async) Construct a new instance of the Java Virtual Machine.
     */
    constructor(opts: JVMOptions, cb: (e: any, jvm?: JVM) => void);
    getResponsiveness(): number;
    static getDefaultOptions(doppioHome: string): JVMOptions;
    /**
     * Get the URL to the version of the JDK that DoppioJVM was compiled with.
     */
    static getCompiledJDKURL(): string;
    /**
     * Get the JDK information that DoppioJVM was compiled against.
     */
    static getJDKInfo(): any;
    getSystemClassLoader(): ClassLoader;
    /**
     * Get the next "ref" number for JVM objects.
     */
    getNextRef(): number;
    /**
     * Retrieve the JVM's parker. Handles parking/unparking threads.
     */
    getParker(): Parker;
    /**
     * Run the specified class on this JVM instance.
     * @param className The name of the class to run. Can be specified in either
     *   foo.bar.Baz or foo/bar/Baz format.
     * @param args Command line arguments passed to the class.
     * @param cb Called when the JVM finishes executing. Called with 'true' if
     *   the JVM exited normally, 'false' if there was an error.
     */
    runClass(className: string, args: string[], cb: (code: number) => void): void;
    /**
     * Returns 'true' if confined to interpreter mode
     */
    isJITDisabled(): boolean;
    /**
     * [DEBUG] Returns 'true' if the specified method should be vtraced.
     */
    shouldVtrace(sig: string): boolean;
    /**
     * [DEBUG] Specify a method to vtrace.
     */
    vtraceMethod(sig: string): void;
    /**
     * Run the specified JAR file on this JVM instance.
     * @param args Command line arguments passed to the class.
     * @param cb Called when the JVM finishes executing. Called with 'true' if
     *   the JVM exited normally, 'false' if there was an error.
     */
    runJar(args: string[], cb: (code: number) => void): void;
    /**
     * Called when the ThreadPool is empty.
     */
    private threadPoolIsEmpty();
    /**
     * Check if the JVM has started running the main class.
     */
    hasVMBooted(): boolean;
    /**
     * Completely halt the JVM.
     */
    halt(status: number): void;
    /**
     * Retrieve the given system property.
     */
    getSystemProperty(prop: string): string;
    /**
     * Retrieve an array of all of the system property names.
     */
    getSystemPropertyNames(): string[];
    /**
     * Retrieve the unmanaged heap.
     */
    getHeap(): Heap;
    /**
     * Interns the given JavaScript string. Returns the interned string.
     */
    internString(str: string, javaObj?: JVMTypes.java_lang_String): JVMTypes.java_lang_String;
    /**
     * Evaluate native modules. Emulates CommonJS functionality.
     */
    private evalNativeModule(mod);
    /**
     * Register native methods with the virtual machine.
     */
    registerNatives(newNatives: {
        [clsName: string]: {
            [methSig: string]: Function;
        };
    }): void;
    /**
     * Convenience function. Register a single native method with the virtual
     * machine. Can be used to update existing native methods based on runtime
     * information.
     */
    registerNative(clsName: string, methSig: string, native: Function): void;
    /**
     * Retrieve the native method for the given method of the given class.
     * Returns null if none found.
     */
    getNative(clsName: string, methSig: string): Function;
    /**
     * !!DO NOT MUTATE THE RETURNED VALUE!!
     * Used by the find_invalid_natives tool.
     */
    getNatives(): {
        [clsName: string]: {
            [methSig: string]: Function;
        };
    };
    /**
     * Loads in all of the native method modules prior to execution.
     * Currently a hack around our
     * @todo Make neater with async stuff.
     */
    private initializeNatives(doneCb);
    /**
     * [Private] Same as reset_system_properties, but called by the constructor.
     */
    private _initSystemProperties(bootstrapClasspath, javaClassPath, javaHomePath, tmpDir, opts);
    /**
     * Retrieves the bootstrap class loader.
     */
    getBootstrapClassLoader(): BootstrapClassLoader;
    getStartupTime(): Date;
    /**
     * Returns `true` if system assertions are enabled, false otherwise.
     */
    areSystemAssertionsEnabled(): boolean;
    /**
     * Get a listing of classes with assertions enabled. Can also return 'true' or 'false.
     */
    getEnabledAssertions(): string[] | boolean;
    /**
     * Get a listing of classes with assertions disabled.
     */
    getDisabledAssertions(): string[];
    setPrintJITCompilation(enabledOrNot: boolean): void;
    shouldPrintJITCompilation(): boolean;
    /**
     * Specifies a directory to dump compiled code to.
     */
    dumpCompiledCode(dir: string): void;
    shouldDumpCompiledCode(): boolean;
    dumpObjectDefinition(cls: ClassData, evalText: string): void;
    dumpBridgeMethod(methodSig: string, evalText: string): void;
    dumpCompiledMethod(methodSig: string, pc: number, code: string): void;
    /**
     * Asynchronously dumps JVM state to a file. Currently limited to thread
     * state.
     */
    dumpState(filename: string, cb: (er: any) => void): void;
}
export default JVM;
