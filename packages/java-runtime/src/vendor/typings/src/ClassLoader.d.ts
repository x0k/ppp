/// <reference types="node" />
import { ClassData, ReferenceClassData, ArrayClassData, PrimitiveClassData } from './ClassData';
import { JVMThread } from './threading';
import { IClasspathItem } from './classpath';
import * as JVMTypes from '../includes/JVMTypes';
/**
 * Base classloader class. Contains common class resolution and instantiation
 * logic.
 */
export declare abstract class ClassLoader {
    bootstrap: BootstrapClassLoader;
    /**
     * Stores loaded *reference* and *array* classes.
     */
    private loadedClasses;
    /**
     * Stores callbacks that are waiting for another thread to finish loading
     * the specified class.
     */
    private loadClassLocks;
    /**
     * @param bootstrap The JVM's bootstrap classloader. ClassLoaders use it
     *   to retrieve primitive types.
     */
    constructor(bootstrap: BootstrapClassLoader);
    /**
     * Retrieve a listing of classes that are loaded in this class loader.
     */
    getLoadedClassNames(): string[];
    /**
     * Adds the specified class to the classloader. As opposed to defineClass,
     * which defines a new class from bytes with the classloader.
     *
     * What's the difference?
     * * Classes created with defineClass are defined by this classloader.
     * * Classes added with addClass may have been defined by a different
     *   classloader. This happens when a custom class loader's loadClass
     *   function proxies classloading to a different classloader.
     *
     * @param typeStr The type string of the class.
     * @param classData The class data object representing the class.
     */
    addClass(typeStr: string, classData: ClassData): void;
    /**
     * No-frills. Get the class if it's defined in the class loader, no matter
     * what shape it is in.
     *
     * Should only be used internally by ClassLoader subclasses.
     */
    protected getClass(typeStr: string): ClassData;
    /**
     * Defines a new class with the class loader from an array of bytes.
     * @param thread The thread that is currently in control when this class is
     *   being defined. An exception may be thrown if there is an issue parsing
     *   the class file.
     * @param typeStr The type string of the class (e.g. "Ljava/lang/Object;")
     * @param data The data associated with the class as a binary blob.
     * @param protectionDomain The protection domain for the class (can be NULL).
     * @return The defined class, or null if there was an issue.
     */
    defineClass<T extends JVMTypes.java_lang_Object>(thread: JVMThread, typeStr: string, data: Buffer, protectionDomain: JVMTypes.java_security_ProtectionDomain): ReferenceClassData<T>;
    /**
     * Defines a new array class with this loader.
     */
    protected defineArrayClass<T>(typeStr: string): ArrayClassData<T>;
    /**
     * Attempts to retrieve the given loaded class.
     * @param typeStr The name of the class.
     * @return Returns the loaded class, or null if no such class is currently
     *   loaded.
     */
    getLoadedClass(typeStr: string): ClassData;
    /**
     * Attempts to retrieve the given resolved class.
     * @param typeStr The name of the class.
     * @return Returns the class if it is both loaded and resolved. Returns null
     *   if this is not the case.
     */
    getResolvedClass(typeStr: string): ClassData;
    /**
     * Attempts to retrieve the given initialized class.
     * @param typeStr The name of the class.
     * @return Returns the class if it is initialized. Returns null if this is
     *   not the case.
     */
    getInitializedClass(thread: JVMThread, typeStr: string): ClassData;
    /**
     * Asynchronously loads the given class.
     */
    loadClass(thread: JVMThread, typeStr: string, cb: (cdata: ClassData) => void, explicit?: boolean): void;
    /**
     * Asynchronously loads the given class. Works differently for bootstrap and
     * custom class loaders.
     *
     * Should never be invoked directly! Use loadClass.
     */
    protected abstract _loadClass(thread: JVMThread, typeStr: string, cb: (cdata: ClassData) => void, explicit?: boolean): void;
    /**
     * Convenience function: Resolve many classes. Calls cb with null should
     * an error occur.
     */
    resolveClasses(thread: JVMThread, typeStrs: string[], cb: (classes: {
        [typeStr: string]: ClassData;
    }) => void): void;
    /**
     * Asynchronously *resolves* the given class by loading the class and
     * resolving its super class, interfaces, and/or component classes.
     */
    resolveClass(thread: JVMThread, typeStr: string, cb: (cdata: ClassData) => void, explicit?: boolean): void;
    /**
     * Asynchronously *initializes* the given class and its super classes.
     */
    initializeClass(thread: JVMThread, typeStr: string, cb: (cdata: ClassData) => void, explicit?: boolean): void;
    /**
     * Throws the appropriate exception/error for a class not being found.
     * If loading was implicitly triggered by the JVM, we call NoClassDefFoundError.
     * If the program explicitly called loadClass, then we throw the ClassNotFoundException.
     */
    protected throwClassNotFoundException(thread: JVMThread, typeStr: string, explicit: boolean): void;
    /**
     * Returns the JVM object corresponding to this ClassLoader.
     */
    abstract getLoaderObject(): JVMTypes.java_lang_ClassLoader;
}
/**
 * The JVM's bootstrap class loader. Loads classes directly from files on the
 * file system.
 */
export declare class BootstrapClassLoader extends ClassLoader {
    /**
     * The classpath. The first path in the array is the first searched.
     * Meaning: The *end* of this array is the bootstrap class loader, and the
     *   *beginning* of the array is the classpath item added last.
     */
    private classpath;
    /**
     * Keeps track of all loaded packages, and the classpath item(s) from
     * whence their packages came.
     *
     * Note: Package separators are specified with slashes ('/'), not periods ('.').
     */
    private loadedPackages;
    /**
     * Constructs the bootstrap classloader with the given classpath.
     * @param classPath The classpath, where the *first* item is the *last*
     *   classpath searched. Meaning, the classPath[0] should be the bootstrap
     *   class path.
     * @param extractionPath The path where jar files should be extracted.
     * @param cb Called once all of the classpath items have been checked.
     *   Passes an error if one occurs.
     */
    constructor(javaHome: string, classpath: string[], cb: (e?: any) => void);
    /**
     * Registers that a given class has successfully been loaded from the specified
     * classpath item.
     */
    private _registerLoadedClass(clsType, cpItem);
    /**
     * Returns a listing of tuples containing:
     * * The package name (e.g. java/lang)
     * * Classpath locations where classes in the package were loaded.
     */
    getPackages(): [string, string[]][];
    /**
     * Retrieves or defines the specified primitive class.
     */
    getPrimitiveClass(typeStr: string): PrimitiveClassData;
    /**
     * Asynchronously load the given class from the classpath.
     *
     * SHOULD ONLY BE INVOKED INTERNALLY BY THE CLASSLOADER.
     */
    protected _loadClass(thread: JVMThread, typeStr: string, cb: (cdata: ClassData) => void, explicit?: boolean): void;
    /**
     * Returns a listing of reference classes loaded in the bootstrap loader.
     */
    getLoadedClassFiles(): string[];
    /**
     * Returns the JVM object corresponding to this ClassLoader.
     * @todo Represent the bootstrap by something other than 'null'.
     * @todo These should be one-in-the-same.
     */
    getLoaderObject(): JVMTypes.java_lang_ClassLoader;
    /**
     * Returns the current classpath.
     */
    getClassPath(): string[];
    /**
     * Returns the classpath item objects in the classpath.
     */
    getClassPathItems(): IClasspathItem[];
}
/**
 * A Custom ClassLoader. Loads classes by calling loadClass on the user-defined
 * loader.
 */
export declare class CustomClassLoader extends ClassLoader {
    private loaderObj;
    constructor(bootstrap: BootstrapClassLoader, loaderObj: JVMTypes.java_lang_ClassLoader);
    /**
     * Asynchronously load the given class from the classpath. Calls the
     * classloader's loadClass method.
     *
     * SHOULD ONLY BE INVOKED BY THE CLASS LOADER.
     *
     * @param thread The thread that triggered the loading.
     * @param typeStr The type string of the class.
     * @param cb The callback that will be called with the loaded class. It will
     *   be passed a null if there is an error -- which also indicates that it
     *   threw an exception on the JVM thread.
     * @param explicit 'True' if loadClass was explicitly invoked by the program,
     *   false otherwise. This changes the exception/error that we throw.
     */
    protected _loadClass(thread: JVMThread, typeStr: string, cb: (cdata: ClassData) => void, explicit?: boolean): void;
    /**
     * Returns the JVM object corresponding to this ClassLoader.
     * @todo These should be one-in-the-same.
     */
    getLoaderObject(): JVMTypes.java_lang_ClassLoader;
}
