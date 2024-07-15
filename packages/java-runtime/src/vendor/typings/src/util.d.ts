/// <reference types="node" />
import { JVMThread } from './threading';
import * as JVMTypes from '../includes/JVMTypes';
import { ClassLoader } from './ClassLoader';
import { ReferenceClassData, ArrayClassData } from './ClassData';
/**
 * util contains stateless utility functions that are used around Doppio's
 * codebase.
 * TODO: Separate general JS utility methods from JVM utility methods.
 */
/**
 * Merges object literals together into a new object. Emulates underscore's merge function.
 */
export declare function merge(...literals: {
    [prop: string]: any;
}[]): {
    [prop: string]: any;
};
export declare function are_in_browser(): boolean;
export declare var typedArraysSupported: boolean;
/**
 * Converts JVM internal names into JS-safe names. Only for use with reference
 * types.
 * Ljava/lang/Object; => java_lang_Object
 * Lfoo/Bar_baz; => foo_Bar__baz
 *
 * Is NOT meant to be unambiguous!
 *
 * Also handles the special characters described here:
 * https://blogs.oracle.com/jrose/entry/symbolic_freedom_in_the_vm
 */
export declare function jvmName2JSName(jvmName: string): string;
/**
 * Re-escapes JVM names for eval'd code. Otherwise, JavaScript removes the escapes.
 */
export declare function reescapeJVMName(jvmName: string): string;
/**
 * Applies an async function to each element of a list, in order.
 */
export declare function asyncForEach<T>(lst: Array<T>, fn: (elem: T, next_item: (err?: any) => void) => void, done_cb: (err?: any) => void): void;
/**
 * Runs the specified tasks in series.
 */
export declare function asyncSeries(tasks: {
    (next: (err?: any) => void): void;
}[], doneCb: (err?: any) => void): void;
/**
 * Applies the function to each element of the list in order in series.
 * The first element that returns success halts the process, and triggers
 * done_cb. If no elements return success, done_cb is triggered with no
 * arguments.
 *
 * I wrote this specifically for classloading, but it may have uses elsewhere.
 */
export declare function asyncFind<T>(lst: Array<T>, fn: (elem: T, nextItem: (success: boolean) => void) => void, done_cb: (elem?: T) => void): void;
/**
 * Checks if accessingCls has permission to a field or method with the given
 * flags on owningCls.
 *
 * Modifier    | Class | Package | Subclass | World
 * ————————————+———————+—————————+——————————+———————
 * public      |  y    |    y    |    y     |   y
 * ————————————+———————+—————————+——————————+———————
 * protected   |  y    |    y    |    y     |   n
 * ————————————+———————+—————————+——————————+———————
 * no modifier |  y    |    y    |    n     |   n
 * ————————————+———————+—————————+——————————+———————
 * private     |  y    |    n    |    n     |   n
 *
 * y: accessible
 * n: not accessible
 */
export declare function checkAccess(accessingCls: ReferenceClassData<JVMTypes.java_lang_Object>, owningCls: ReferenceClassData<JVMTypes.java_lang_Object>, accessFlags: Flags): boolean;
/**
 * Truncates a floating point into an integer.
 */
export declare function float2int(a: number): number;
/**
 * Converts a byte array to a buffer. **Copies.**
 */
export declare function byteArray2Buffer(bytes: number[] | Int8Array, offset?: number, len?: number): NodeBuffer;
export interface Arrayish {
    [idx: number]: number;
}
export declare function isUint8Array(arr: Arrayish): arr is Uint8Array;
export declare function isInt8Array(arr: Arrayish): arr is Int8Array;
/**
 * Converts an Int8Array or an array of 8-bit signed ints into
 * a Uint8Array or an array of 8-bit unsigned ints.
 */
export declare function i82u8(arr: number[] | Int8Array, start: number, len: number): number[] | Uint8Array;
/**
 * Converts an Uint8Array or an array of 8-bit unsigned ints into
 * an Int8Array or an array of 8-bit signed ints.
 */
export declare function u82i8(arr: number[] | Uint8Array | Buffer, start?: number, len?: number): number[] | Int8Array;
export declare function wrapFloat(a: number): number;
export declare function chars2jsStr(jvmCarr: JVMTypes.JVMArray<number>, offset?: number, count?: number): string;
export declare function bytestr2Array(byteStr: string): number[];
export declare function array2bytestr(byteArray: number[]): string;
/**
 * Bit masks for the flag byte.
 */
export declare enum FlagMasks {
    PUBLIC = 1,
    PRIVATE = 2,
    PROTECTED = 4,
    STATIC = 8,
    FINAL = 16,
    SYNCHRONIZED = 32,
    SUPER = 32,
    VOLATILE = 64,
    TRANSIENT = 128,
    VARARGS = 128,
    NATIVE = 256,
    INTERFACE = 512,
    ABSTRACT = 1024,
    STRICT = 2048,
}
/**
 * Represents a 'flag byte'. See �4 of the JVM spec.
 * @todo Separate METHOD flags and CLASS flags.
 */
export declare class Flags {
    private byte;
    constructor(byte: number);
    isPublic(): boolean;
    isPrivate(): boolean;
    isProtected(): boolean;
    isStatic(): boolean;
    isFinal(): boolean;
    isSynchronized(): boolean;
    isSuper(): boolean;
    isVolatile(): boolean;
    isTransient(): boolean;
    isNative(): boolean;
    isInterface(): boolean;
    isAbstract(): boolean;
    isStrict(): boolean;
    /**
     * Changes a function to native. Used for trapped methods.
     */
    setNative(n: boolean): void;
    isVarArgs(): boolean;
    getRawByte(): number;
}
export declare function initialValue(type_str: string): any;
/**
 * Java classes are represented internally using slashes as delimiters.
 * These helper functions convert between the two representations.
 * Ljava/lang/Class; => java.lang.Class
 */
export declare function ext_classname(str: string): string;
/**
 * java.lang.Class => Ljava/lang/Class;
 */
export declare function int_classname(str: string): string;
export declare function verify_int_classname(str: string): boolean;
export declare var internal2external: {
    [internalType: string]: string;
};
export declare var external2internal: {
    [externalType: string]: string;
};
/**
 * Given a method descriptor, returns the typestrings for the return type
 * and the parameters.
 *
 * e.g. (Ljava/lang/Class;Z)Ljava/lang/String; =>
 *        ["Ljava/lang/Class;", "Z", "Ljava/lang/String;"]
 */
export declare function getTypes(methodDescriptor: string): string[];
export declare function get_component_type(type_str: string): string;
export declare function is_array_type(type_str: string): boolean;
export declare function is_primitive_type(type_str: string): boolean;
export declare function is_reference_type(type_str: string): boolean;
/**
 * Converts type descriptors into standardized internal type strings.
 * Ljava/lang/Class; => java/lang/Class   Reference types
 * [Ljava/lang/Class; is unchanged        Array types
 * C => char                              Primitive types
 */
export declare function descriptor2typestr(type_str: string): string;
export declare function carr2descriptor(carr: string[]): string;
export declare function typestr2descriptor(type_str: string): string;
/**
 * Java's reflection APIs need to unbox primitive arguments to function calls,
 * as they are boxed in an Object array. This utility function converts
 * an array of arguments into the appropriate form prior to function invocation.
 * Note that this includes padding category 2 primitives, which consume two
 * slots in the array (doubles/longs).
 */
export declare function unboxArguments(thread: JVMThread, paramTypes: string[], args: JVMTypes.java_lang_Object[]): any[];
/**
 * Given a method descriptor as a JS string, returns a corresponding MethodType
 * object.
 */
export declare function createMethodType(thread: JVMThread, cl: ClassLoader, descriptor: string, cb: (e: JVMTypes.java_lang_Throwable, type: JVMTypes.java_lang_invoke_MethodType) => void): void;
/**
 * Given a method descriptor, returns the number of words required to store
 * its arguments.
 * Does not include considerations for e.g. the 'this' argument, since the
 * descriptor does not specify if the method is static or not.
 */
export declare function getMethodDescriptorWordSize(descriptor: string): number;
/**
 * Given a return type as a Class object, and an array of class objects for
 * parameter types, returns the descriptor string for the method type.
 */
export declare function getDescriptorString(rtype: JVMTypes.java_lang_Class, ptypes?: JVMTypes.JVMArray<JVMTypes.java_lang_Class>): string;
/**
 * Have a JavaClassLoaderObject and need its ClassLoader object? Use this method!
 * @todo Install on Java ClassLoader objects.
 */
export declare function getLoader(thread: JVMThread, jclo: JVMTypes.java_lang_ClassLoader): ClassLoader;
/**
 * "Fast" array copy; does not have to check every element for illegal
 * assignments. You can do tricks here (if possible) to copy chunks of the array
 * at a time rather than element-by-element.
 * This function *cannot* access any attribute other than 'array' on src due to
 * the special case when src == dest (see code for System.arraycopy below).
 */
export declare function arraycopyNoCheck(src: JVMTypes.JVMArray<any>, srcPos: number, dest: JVMTypes.JVMArray<any>, destPos: number, length: number): void;
/**
 * "Slow" array copy; has to check every element for illegal assignments.
 * You cannot do any tricks here; you must copy element by element until you
 * have either copied everything, or encountered an element that cannot be
 * assigned (which causes an exception).
 * Guarantees: src and dest are two different reference types. They cannot be
 *             primitive arrays.
 */
export declare function arraycopyCheck(thread: JVMThread, src: JVMTypes.JVMArray<JVMTypes.java_lang_Object>, srcPos: number, dest: JVMTypes.JVMArray<JVMTypes.java_lang_Object>, destPos: number, length: number): void;
export declare function initString(cl: ClassLoader, str: string): JVMTypes.java_lang_String;
export declare function initCarr(cl: ClassLoader, str: string): JVMTypes.JVMArray<number>;
export declare function newArrayFromClass<T>(thread: JVMThread, clazz: ArrayClassData<T>, length: number): JVMTypes.JVMArray<T>;
export declare function newArray<T>(thread: JVMThread, cl: ClassLoader, desc: string, length: number): JVMTypes.JVMArray<T>;
/**
 * Separate from newArray to avoid programming mistakes where newArray and newArrayFromData are conflated.
 */
export declare function multiNewArray<T>(thread: JVMThread, cl: ClassLoader, desc: string, lengths: number[]): JVMTypes.JVMArray<T>;
export declare function newObjectFromClass<T extends JVMTypes.java_lang_Object>(thread: JVMThread, clazz: ReferenceClassData<T>): T;
export declare function newObject<T extends JVMTypes.java_lang_Object>(thread: JVMThread, cl: ClassLoader, desc: string): T;
export declare function getStaticFields<T>(thread: JVMThread, cl: ClassLoader, desc: string): T;
export declare function newArrayFromDataWithClass<T>(thread: JVMThread, cls: ArrayClassData<T>, data: T[]): JVMTypes.JVMArray<T>;
export declare function newArrayFromData<T>(thread: JVMThread, cl: ClassLoader, desc: string, data: T[]): JVMTypes.JVMArray<T>;
/**
 * Returns the boxed class name of the given primitive type.
 */
export declare function boxClassName(primType: string): string;
/**
 * Boxes the given primitive value.
 */
export declare function boxPrimitiveValue(thread: JVMThread, type: string, val: any): JVMTypes.java_lang_Integer;
/**
 * Boxes the given arguments into an Object[].
 *
 * @param descriptor The descriptor at the *call site*.
 * @param data The actual arguments for this function call.
 * @param isStatic If false, disregard the first type in the descriptor, as it is the 'this' argument.
 */
export declare function boxArguments(thread: JVMThread, objArrCls: ArrayClassData<JVMTypes.java_lang_Object>, descriptor: string, data: any[], isStatic: boolean, skipArgs?: number): JVMTypes.JVMArray<JVMTypes.java_lang_Object>;
export declare function forwardResult<T extends JVMTypes.java_lang_Object>(thread: JVMThread): (e?: JVMTypes.java_lang_Throwable, rv?: T) => void;
