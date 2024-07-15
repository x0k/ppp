/// <reference types="node" />
import gLong from './gLong';
import ByteStream from './ByteStream';
import { ConstantPoolItemType, MethodHandleReferenceKind } from './enums';
import { ReferenceClassData, ArrayClassData, IJVMConstructor } from './ClassData';
import { Method, Field } from './methods';
import { ClassLoader } from './ClassLoader';
import { JVMThread, BytecodeStackFrame } from './threading';
import * as JVMTypes from '../includes/JVMTypes';
/**
 * Represents a constant pool item. Use the item's type to discriminate among them.
 */
export interface IConstantPoolItem {
    getType(): ConstantPoolItemType;
    /**
     * Is this constant pool item resolved? Use to discriminate among resolved
     * and unresolved reference types.
     */
    isResolved(): boolean;
    /**
     * Returns the constant associated with the constant pool item. The item *must*
     * be resolved.
     * Only defined on constant pool items that return values through LDC.
     */
    getConstant?(thread: JVMThread): any;
    /**
     * Resolves an unresolved constant pool item. Can only be called if
     * isResolved() returns false.
     */
    resolve?(thread: JVMThread, cl: ClassLoader, caller: ReferenceClassData<JVMTypes.java_lang_Object>, cb: (status: boolean) => void, explicit?: boolean): void;
}
/**
 * All constant pool items have a static constructor function.
 */
export interface IConstantPoolType {
    fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
    /**
     * The resulting size in the constant pool, in machine words.
     */
    size: number;
    /**
     * The bytesize on disk of the item's information past the tag byte.
     */
    infoByteSize: number;
}
/**
 * Represents a constant UTF-8 string.
 * ```
 * CONSTANT_Utf8_info {
 *   u1 tag;
 *   u2 length;
 *   u1 bytes[length];
 * }
 * ```
 */
export declare class ConstUTF8 implements IConstantPoolItem {
    value: string;
    constructor(rawBytes: Buffer);
    /**
     * Parse Java's pseudo-UTF-8 strings into valid UTF-16 codepoints (spec 4.4.7)
     * Note that Java uses UTF-16 internally by default for string representation,
     * and the pseudo-UTF-8 strings are *only* used for serialization purposes.
     * Thus, there is no reason for other parts of the code to call this routine!
     * TODO: To avoid copying, create a character array for this data.
     * http://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.4.7
     */
    private bytes2str(bytes);
    getType(): ConstantPoolItemType;
    getConstant(thread: JVMThread): string;
    isResolved(): boolean;
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
/**
 * Represents a constant 32-bit integer.
 * ```
 * CONSTANT_Integer_info {
 *   u1 tag;
 *   u4 bytes;
 * }
 * ```
 */
export declare class ConstInt32 implements IConstantPoolItem {
    value: number;
    constructor(value: number);
    getType(): ConstantPoolItemType;
    getConstant(thread: JVMThread): number;
    isResolved(): boolean;
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
/**
 * Represents a constant 32-bit floating point number.
 * ```
 * CONSTANT_Float_info {
 *   u1 tag;
 *   u4 bytes;
 * }
 * ```
 */
export declare class ConstFloat implements IConstantPoolItem {
    value: number;
    constructor(value: number);
    getType(): ConstantPoolItemType;
    getConstant(thread: JVMThread): number;
    isResolved(): boolean;
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
/**
 * Represents a constant 64-bit integer.
 * ```
 * CONSTANT_Long_info {
 *   u1 tag;
 *   u4 high_bytes;
 *   u4 low_bytes;
 * }
 * ```
 */
export declare class ConstLong implements IConstantPoolItem {
    value: gLong;
    constructor(value: gLong);
    getType(): ConstantPoolItemType;
    getConstant(thread: JVMThread): gLong;
    isResolved(): boolean;
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
/**
 * Represents a constant 64-bit floating point number.
 * ```
 * CONSTANT_Double_info {
 *   u1 tag;
 *   u4 high_bytes;
 *   u4 low_bytes;
 * }
 * ```
 */
export declare class ConstDouble implements IConstantPoolItem {
    value: number;
    constructor(value: number);
    getType(): ConstantPoolItemType;
    getConstant(thread: JVMThread): number;
    isResolved(): boolean;
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
/**
 * Represents a class or interface.
 * ```
 * CONSTANT_Class_info {
 *   u1 tag;
 *   u2 name_index;
 * }
 * ```
 * @todo Have a classloader-local cache of class reference objects.
 */
export declare class ClassReference implements IConstantPoolItem {
    /**
     * The name of the class, in full descriptor form, e.g.:
     * Lfoo/bar/Baz;
     */
    name: string;
    /**
     * The resolved class reference.
     */
    cls: ReferenceClassData<JVMTypes.java_lang_Object> | ArrayClassData<any>;
    /**
     * The JavaScript constructor for the referenced class.
     */
    clsConstructor: IJVMConstructor<JVMTypes.java_lang_Object>;
    /**
     * The array class for the resolved class reference.
     */
    arrayClass: ArrayClassData<any>;
    /**
     * The JavaScript constructor for the array class.
     */
    arrayClassConstructor: IJVMConstructor<JVMTypes.JVMArray<any>>;
    constructor(name: string);
    /**
     * Attempt to synchronously resolve.
     */
    tryResolve(loader: ClassLoader): boolean;
    /**
     * Resolves the class reference by resolving the class. Does not run
     * class initialization.
     */
    resolve(thread: JVMThread, loader: ClassLoader, caller: ReferenceClassData<JVMTypes.java_lang_Object>, cb: (status: boolean) => void, explicit?: boolean): void;
    private setResolved(thread, cls);
    getType(): ConstantPoolItemType;
    getConstant(thread: JVMThread): JVMTypes.java_lang_Class;
    isResolved(): boolean;
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
/**
 * Represents a field or method without indicating which class or interface
 * type it belongs to.
 * ```
 * CONSTANT_NameAndType_info {
 *   u1 tag;
 *   u2 name_index;
 *   u2 descriptor_index;
 * }
 * ```
 */
export declare class NameAndTypeInfo implements IConstantPoolItem {
    name: string;
    descriptor: string;
    constructor(name: string, descriptor: string);
    getType(): ConstantPoolItemType;
    isResolved(): boolean;
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
/**
 * Represents constant objects of the type java.lang.String.
 * ```
 * CONSTANT_String_info {
 *   u1 tag;
 *   u2 string_index;
 * }
 * ```
 */
export declare class ConstString implements IConstantPoolItem {
    stringValue: string;
    value: JVMTypes.java_lang_String;
    constructor(stringValue: string);
    getType(): ConstantPoolItemType;
    resolve(thread: JVMThread, loader: ClassLoader, caller: ReferenceClassData<JVMTypes.java_lang_Object>, cb: (status: boolean) => void): void;
    getConstant(thread: JVMThread): JVMTypes.java_lang_String;
    isResolved(): boolean;
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
/**
 * Represents a given method type.
 * ```
 * CONSTANT_MethodType_info {
 *   u1 tag;
 *   u2 descriptor_index;
 * }
 * ```
 */
export declare class MethodType implements IConstantPoolItem {
    private descriptor;
    methodType: JVMTypes.java_lang_invoke_MethodType;
    constructor(descriptor: string);
    resolve(thread: JVMThread, cl: ClassLoader, caller: ReferenceClassData<JVMTypes.java_lang_Object>, cb: (status: boolean) => void): void;
    getConstant(thread: JVMThread): JVMTypes.java_lang_invoke_MethodType;
    getType(): ConstantPoolItemType;
    isResolved(): boolean;
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
/**
 * Represents a particular method.
 * ```
 * CONSTANT_Methodref_info {
 *   u1 tag;
 *   u2 class_index;
 *   u2 name_and_type_index;
 * }
 * ```
 */
export declare class MethodReference implements IConstantPoolItem {
    classInfo: ClassReference;
    nameAndTypeInfo: NameAndTypeInfo;
    method: Method;
    /**
     * The signature of the method, without the owning class.
     * e.g. foo(IJ)V
     */
    signature: string;
    /**
     * The signature of the method, including the owning class.
     * e.g. bar/Baz/foo(IJ)V
     */
    fullSignature: string;
    paramWordSize: number;
    /**
     * Contains a reference to the MemberName object for the method that invokes
     * the desired function.
     */
    memberName: JVMTypes.java_lang_invoke_MemberName;
    /**
     * Contains an object that needs to be pushed onto the stack before invoking
     * memberName.
     */
    appendix: JVMTypes.java_lang_Object;
    /**
     * The JavaScript constructor for the class that the method belongs to.
     */
    jsConstructor: any;
    constructor(classInfo: ClassReference, nameAndTypeInfo: NameAndTypeInfo);
    getType(): ConstantPoolItemType;
    /**
     * Checks the method referenced by this constant pool item in the specified
     * bytecode context.
     * Returns null if an error occurs.
     * - Throws a NoSuchFieldError if missing.
     * - Throws an IllegalAccessError if field is inaccessible.
     * - Throws an IncompatibleClassChangeError if the field is an incorrect type
     *   for the field access.
     */
    hasAccess(thread: JVMThread, frame: BytecodeStackFrame, isStatic: boolean): boolean;
    private resolveMemberName(method, thread, cl, caller, cb);
    resolve(thread: JVMThread, loader: ClassLoader, caller: ReferenceClassData<JVMTypes.java_lang_Object>, cb: (status: boolean) => void, explicit?: boolean): void;
    setResolved(thread: JVMThread, method: Method): void;
    isResolved(): boolean;
    getParamWordSize(): number;
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
/**
 * Represents a particular interface method.
 * ```
 * CONSTANT_InterfaceMethodref_info {
 *   u1 tag;
 *   u2 class_index;
 *   u2 name_and_type_index;
 * }
 * ```
 */
export declare class InterfaceMethodReference implements IConstantPoolItem {
    classInfo: ClassReference;
    nameAndTypeInfo: NameAndTypeInfo;
    /**
     * The signature of the method, without the owning class.
     * e.g. foo(IJ)V
     */
    signature: string;
    /**
     * The signature of the method, including the owning class.
     * e.g. bar/Baz/foo(IJ)V
     */
    fullSignature: string;
    method: Method;
    paramWordSize: number;
    jsConstructor: any;
    constructor(classInfo: ClassReference, nameAndTypeInfo: NameAndTypeInfo);
    getType(): ConstantPoolItemType;
    /**
     * Checks the method referenced by this constant pool item in the specified
     * bytecode context.
     * Returns null if an error occurs.
     * - Throws a NoSuchFieldError if missing.
     * - Throws an IllegalAccessError if field is inaccessible.
     * - Throws an IncompatibleClassChangeError if the field is an incorrect type
     *   for the field access.
     */
    hasAccess(thread: JVMThread, frame: BytecodeStackFrame, isStatic: boolean): boolean;
    resolve(thread: JVMThread, loader: ClassLoader, caller: ReferenceClassData<JVMTypes.java_lang_Object>, cb: (status: boolean) => void, explicit?: boolean): void;
    setResolved(thread: JVMThread, method: Method): void;
    getParamWordSize(): number;
    isResolved(): boolean;
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
/**
 * Represents a particular field.
 * ```
 * CONSTANT_Fieldref_info {
 *   u1 tag;
 *   u2 class_index;
 *   u2 name_and_type_index;
 * }
 * ```
 */
export declare class FieldReference implements IConstantPoolItem {
    classInfo: ClassReference;
    nameAndTypeInfo: NameAndTypeInfo;
    field: Field;
    /**
     * The full name of the field, including the owning class.
     * e.g. java/lang/String/value
     */
    fullFieldName: string;
    /**
     * The constructor for the field owner. Used for static fields.
     */
    fieldOwnerConstructor: any;
    constructor(classInfo: ClassReference, nameAndTypeInfo: NameAndTypeInfo);
    getType(): ConstantPoolItemType;
    /**
     * Checks the field referenced by this constant pool item in the specified
     * bytecode context.
     * Returns null if an error occurs.
     * - Throws a NoSuchFieldError if missing.
     * - Throws an IllegalAccessError if field is inaccessible.
     * - Throws an IncompatibleClassChangeError if the field is an incorrect type
     *   for the field access.
     */
    hasAccess(thread: JVMThread, frame: BytecodeStackFrame, isStatic: boolean): boolean;
    resolve(thread: JVMThread, loader: ClassLoader, caller: ReferenceClassData<JVMTypes.java_lang_Object>, cb: (status: boolean) => void, explicit?: boolean): void;
    isResolved(): boolean;
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
/**
 * Used by an invokedynamic instruction to specify a bootstrap method,
 * the dynamic invocation name, the argument and return types of the call,
 * and optionally, a sequence of additional constants called static arguments
 * to the bootstrap method.
 * ```
 * CONSTANT_InvokeDynamic_info {
 *   u1 tag;
 *   u2 bootstrap_method_attr_index;
 *   u2 name_and_type_index;
 * }
 * ```
 */
export declare class InvokeDynamic implements IConstantPoolItem {
    bootstrapMethodAttrIndex: number;
    nameAndTypeInfo: NameAndTypeInfo;
    /**
     * The parameter word size of the nameAndTypeInfo's descriptor.
     * Does not take appendix into account; this is the static paramWordSize.
     */
    paramWordSize: number;
    /**
     * Once a CallSite is defined for a particular lexical occurrence of
     * InvokeDynamic, the CallSite will be reused for each future execution
     * of that particular occurrence.
     *
     * We store the CallSite objects here for future retrieval, along with an
     * optional 'appendix' argument.
     */
    private callSiteObjects;
    /**
     * A MethodType object corresponding to this InvokeDynamic call's
     * method descriptor.
     */
    private methodType;
    constructor(bootstrapMethodAttrIndex: number, nameAndTypeInfo: NameAndTypeInfo);
    getType(): ConstantPoolItemType;
    isResolved(): boolean;
    resolve(thread: JVMThread, loader: ClassLoader, caller: ReferenceClassData<JVMTypes.java_lang_Object>, cb: (status: boolean) => void): void;
    getCallSiteObject(pc: number): [JVMTypes.java_lang_invoke_MemberName, JVMTypes.java_lang_Object];
    constructCallSiteObject(thread: JVMThread, cl: ClassLoader, clazz: ReferenceClassData<JVMTypes.java_lang_Object>, pc: number, cb: (status: boolean) => void, explicit?: boolean): void;
    private setResolved(pc, cso);
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
export interface IConstantPoolReference extends IConstantPoolItem {
    classInfo: ClassReference;
    nameAndTypeInfo: NameAndTypeInfo;
    getMethodHandleType(thread: JVMThread, cl: ClassLoader, cb: (e: any, type: JVMTypes.java_lang_Object) => void): void;
}
/**
 * Represents a given method handle.
 * ```
 * CONSTANT_MethodHandle_info {
 *   u1 tag;
 *   u1 reference_kind;
 *   u2 reference_index;
 * }
 * ```
 */
export declare class MethodHandle implements IConstantPoolItem {
    private reference;
    private referenceType;
    /**
     * The resolved MethodHandle object.
     */
    methodHandle: JVMTypes.java_lang_invoke_MethodHandle;
    constructor(reference: FieldReference | MethodReference | InterfaceMethodReference, referenceType: MethodHandleReferenceKind);
    getType(): ConstantPoolItemType;
    isResolved(): boolean;
    getConstant(thread: JVMThread): JVMTypes.java_lang_invoke_MethodHandle;
    /**
     * Asynchronously constructs a JVM-visible MethodHandle object for this
     * MethodHandle.
     *
     * Requires producing the following, and passing it to a MethodHandle
     * constructor:
     * * [java.lang.Class] The defining class.
     * * [java.lang.String] The name of the field/method/etc.
     * * [java.lang.invoke.MethodType | java.lang.Class] The type of the field OR,
     *   if a method, the type of the method descriptor.
     *
     * If needed, this function will resolve needed classes.
     */
    resolve(thread: JVMThread, cl: ClassLoader, caller: ReferenceClassData<JVMTypes.java_lang_Object>, cb: (status: boolean) => void, explicit: boolean): void;
    private getDefiningClassObj(thread);
    private constructMethodHandleType(thread, cl, cb);
    static size: number;
    static infoByteSize: number;
    static fromBytes(byteStream: ByteStream, constantPool: ConstantPool): IConstantPoolItem;
}
/**
 * Represents a constant pool for a particular class.
 */
export declare class ConstantPool {
    /**
     * The core constant pool array. Note that some indices are undefined.
     */
    private constantPool;
    parse(byteStream: ByteStream, cpPatches?: JVMTypes.JVMArray<JVMTypes.java_lang_Object>): ByteStream;
    get(idx: number): IConstantPoolItem;
    each(fn: (idx: number, item: IConstantPoolItem) => void): void;
}
