/// <reference types="node" />
import { TriState } from './enums';
import * as fs from 'fs';
import TBFSFS from 'browserfs/dist/node/core/FS';
import TZipFS from 'browserfs/dist/node/backend/ZipFS';
export declare type TZipFS = TZipFS;
export declare type MetaIndex = {
    [pkgName: string]: boolean | MetaIndex;
};
/**
 * Represents an item on the classpath. Used by the bootstrap classloader.
 */
export interface IClasspathItem {
    /**
     * Initializes this item on the classpath. Asynchronous, as the classpath
     * item needs to populate its classlist.
     */
    initialize(cb: () => void): void;
    /**
     * Returns true if this classpath item has the given class.
     * Reference types only.
     * NOTE: Loading of said class is not guaranteed to succeed.
     * @param type Class name in pkg/path/Name format.
     * @returns True if it has the class, false if not, indeterminate if it
     *   cannot be determined synchronously.
     */
    hasClass(type: string): TriState;
    /**
     * Attempt to load the given class synchronously. Returns a buffer,
     * or returns NULL if unsuccessful.
     * @param type Class name in pkg/path/Name format.
     */
    tryLoadClassSync(type: string): Buffer;
    /**
     * Load a class with the given type (e.g. Ljava/lang/String;).
     * @param type Class name in pkg/path/Name format.
     */
    loadClass(type: string, cb: (err: Error, data?: Buffer) => void): void;
    /**
     * Get the path to this classpath item.
     */
    getPath(): string;
    /**
     * Stat a particular resource in the classpath.
     */
    statResource(p: string, cb: (e: Error, stat?: fs.Stats) => void): void;
    /**
     * Read the given directory within the classpath item.
     */
    readdir(p: string, cb: (e: Error, list?: string[]) => void): void;
    /**
     * Tries to perform a readdir synchronously. Returns null if unsuccessful.
     */
    tryReaddirSync(p: string): string[];
    /**
     * Tries to perform a stat operation synchronously. Returns null if unsuccessful.
     */
    tryStatSync(p: string): fs.Stats;
}
/**
 * Represents a JAR file on the classpath.
 */
export declare abstract class AbstractClasspathJar {
    protected _fs: TBFSFS;
    /**
     * Was the JAR file successfully read?
     * - TRUE: JAR file is read and mounted in this._fs.
     * - FALSE: JAR file could not be read.
     * - INDETERMINATE: We have yet to try reading this JAR file.
     */
    protected _jarRead: TriState;
    protected _path: string;
    constructor(path: string);
    getPath(): string;
    loadJar(cb: (e?: Error) => void): void;
    abstract hasClass(type: string): TriState;
    tryLoadClassSync(type: string): Buffer;
    /**
     * Wrap an operation that depends on the jar being loaded.
     */
    private _wrapOp(op, failCb);
    /**
     * Wrap a synchronous operation that depends on the jar being loaded.
     * Returns null if the jar isn't loaded, or if the operation fails.
     */
    private _wrapSyncOp<T>(op);
    loadClass(type: string, cb: (err: Error, data?: Buffer) => void): void;
    statResource(p: string, cb: (err: Error, stats?: fs.Stats) => void): void;
    readdir(p: string, cb: (e: Error, list?: string[]) => void): void;
    tryReaddirSync(p: string): string[];
    tryStatSync(p: string): fs.Stats;
    getFS(): TZipFS;
}
/**
 * A JAR item on the classpath that is not in the meta index.
 */
export declare class UnindexedClasspathJar extends AbstractClasspathJar implements IClasspathItem {
    private _classList;
    constructor(p: string);
    hasClass(type: string): TriState;
    _hasClass(type: string): TriState;
    /**
     * Initialize this item on the classpath with the given classlist.
     * @param classes List of classes in pkg/path/Name format.
     */
    initializeWithClasslist(classes: string[]): void;
    initialize(cb: (e?: Error) => void): void;
}
/**
 * A JAR file on the classpath that is in the meta-index.
 */
export declare class IndexedClasspathJar extends AbstractClasspathJar implements IClasspathItem {
    private _metaIndex;
    private _metaName;
    constructor(metaIndex: MetaIndex, p: string);
    initialize(cb: (e?: Error) => void): void;
    hasClass(type: string): TriState;
}
/**
 * Represents a folder on the classpath.
 */
export declare class ClasspathFolder implements IClasspathItem {
    private _path;
    constructor(path: string);
    getPath(): string;
    hasClass(type: string): TriState;
    initialize(cb: (e?: Error) => void): void;
    tryLoadClassSync(type: string): Buffer;
    loadClass(type: string, cb: (err: Error, data?: Buffer) => void): void;
    statResource(p: string, cb: (err: Error, stats?: fs.Stats) => void): void;
    readdir(p: string, cb: (e: Error, list?: string[]) => void): void;
    tryReaddirSync(p: string): string[];
    tryStatSync(p: string): fs.Stats;
}
/**
 * Represents a classpath item that cannot be found.
 */
export declare class ClasspathNotFound implements IClasspathItem {
    private _path;
    constructor(path: string);
    getPath(): string;
    hasClass(type: string): TriState;
    initialize(cb: (e?: Error) => void): void;
    initializeWithClasslist(classlist: string[]): void;
    tryLoadClassSync(type: string): Buffer;
    private _notFoundError(cb);
    loadClass(type: string, cb: (err: Error, data?: Buffer) => void): void;
    statResource(p: string, cb: (err: Error, stats?: fs.Stats) => void): void;
    readdir(p: string, cb: (e: Error, list?: string[]) => void): void;
    tryReaddirSync(p: string): string[];
    tryStatSync(p: string): fs.Stats;
}
/**
 * Given a list of paths (which may or may not exist), produces a list of
 * classpath objects.
 */
export declare function ClasspathFactory(javaHomePath: string, paths: string[], cb: (items: IClasspathItem[]) => void): void;
