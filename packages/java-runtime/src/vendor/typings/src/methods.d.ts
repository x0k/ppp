/// <reference types="node" />
import { Flags } from './util';
import ByteStream from './ByteStream';
import { IAttribute, Code } from './attributes';
import { ConstantPool } from './ConstantPool';
import { ReferenceClassData } from './ClassData';
import { JVMThread, BytecodeStackFrame } from './threading';
import Monitor from './Monitor';
import StringOutputStream from './StringOutputStream';
import * as JVMTypes from '../includes/JVMTypes';
/**
 * Shared functionality between Method and Field objects, as they are
 * represented similarly in class files.
 */
export declare class AbstractMethodField {
    /**
     * The declaring class of this method or field.
     */
    cls: ReferenceClassData<JVMTypes.java_lang_Object>;
    /**
     * The method / field's index in its defining class's method/field array.
     */
    slot: number;
    /**
     * The method / field's flags (e.g. static).
     */
    accessFlags: Flags;
    /**
     * The name of the field, without the descriptor or owning class.
     */
    name: string;
    /**
     * The method/field's type descriptor.
     * e.g.:
     * public String foo; => Ljava/lang/String;
     * public void foo(String bar); => (Ljava/lang/String;)V
     */
    rawDescriptor: string;
    /**
     * Any attributes on this method or field.
     */
    attrs: IAttribute[];
    /**
     * Constructs a field or method object from raw class data.
     */
    constructor(cls: ReferenceClassData<JVMTypes.java_lang_Object>, constantPool: ConstantPool, slot: number, byteStream: ByteStream);
    getAttribute(name: string): IAttribute;
    getAttributes(name: string): IAttribute[];
    /**
     * Get the particular type of annotation as a JVM byte array. Returns null
     * if the annotation does not exist.
     */
    protected getAnnotationType(thread: JVMThread, name: string): JVMTypes.JVMArray<number>;
    parseDescriptor(raw_descriptor: string): void;
}
export declare class Field extends AbstractMethodField {
    /**
     * The field's full name, which includes the defining class
     * (e.g. java/lang/String/value).
     */
    fullName: string;
    constructor(cls: ReferenceClassData<JVMTypes.java_lang_Object>, constantPool: ConstantPool, slot: number, byteStream: ByteStream);
    /**
     * Calls cb with the reflectedField if it succeeds. Calls cb with null if it
     * fails.
     */
    reflector(thread: JVMThread, cb: (reflectedField: JVMTypes.java_lang_reflect_Field) => void): void;
    private getDefaultFieldValue();
    /**
     * Outputs a JavaScript field assignment for this field.
     */
    outputJavaScriptField(jsConsName: string, outputStream: StringOutputStream): void;
}
export declare class Method extends AbstractMethodField {
    /**
     * The method's parameters, if any, in descriptor form.
     */
    parameterTypes: string[];
    /**
     * The method's return type in descriptor form.
     */
    returnType: string;
    /**
     * The method's signature, e.g. bar()V
     */
    signature: string;
    /**
     * The method's signature, including defining class; e.g. java/lang/String/bar()V
     */
    fullSignature: string;
    /**
     * The number of JVM words required to store the parameters (e.g. longs/doubles take up 2 words).
     * Does not include the "this" argument to non-static functions.
     */
    private parameterWords;
    /**
     * Code is either a function, or a CodeAttribute.
     * TODO: Differentiate between NativeMethod objects and BytecodeMethod objects.
     */
    private code;
    /**
     * number of basic block entries
     */
    private numBBEntries;
    private compiledFunctions;
    private failedCompile;
    constructor(cls: ReferenceClassData<JVMTypes.java_lang_Object>, constantPool: ConstantPool, slot: number, byteStream: ByteStream);
    incrBBEntries(): void;
    /**
     * Checks if the method is a default method.
     * A default method is a public non-abstract instance method, that
     * is, a non-static method with a body, declared in an interface
     * type.
     */
    isDefault(): boolean;
    getFullSignature(): string;
    /**
     * Checks if this particular method should be hidden in stack frames.
     * Used by OpenJDK's lambda implementation to hide lambda boilerplate.
     */
    isHidden(): boolean;
    /**
     * Checks if this particular method has the CallerSensitive annotation.
     */
    isCallerSensitive(): boolean;
    /**
     * Get the number of machine words (32-bit words) required to store the
     * parameters to this function. Includes adding in a machine word for 'this'
     * for non-static functions.
     */
    getParamWordSize(): number;
    getCodeAttribute(): Code;
    getOp(pc: number, codeBuffer: Buffer, thread: JVMThread): any;
    private makeInvokeStaticJitInfo(code, pc);
    private makeInvokeVirtualJitInfo(code, pc);
    private makeInvokeNonVirtualJitInfo(code, pc);
    private jitCompileFrom(startPC, thread);
    getNativeFunction(): Function;
    /**
     * Resolves all of the classes referenced through this method. Required in
     * order to create its reflection object.
     */
    private _resolveReferencedClasses(thread, cb);
    /**
     * Get a reflection object representing this method.
     */
    reflector(thread: JVMThread, cb: (reflectedMethod: JVMTypes.java_lang_reflect_Executable) => void): void;
    /**
     * Convert the arguments to this method into a form suitable for a native
     * implementation.
     *
     * The JVM uses two parameter slots for double and long values, since they
     * consist of two JVM machine words (32-bits). Doppio stores the entire value
     * in one slot, and stores a NULL in the second.
     *
     * This function strips out these NULLs so the arguments are in a more
     * consistent form. The return value is the arguments to this function without
     * these NULL values. It also adds the 'thread' object to the start of the
     * arguments array.
     */
    convertArgs(thread: JVMThread, params: any[]): any[];
    /**
     * Lock this particular method.
     */
    methodLock(thread: JVMThread, frame: BytecodeStackFrame): Monitor;
    /**
     * Check if this is a signature polymorphic method.
     * From S2.9:
     * A method is signature polymorphic if and only if all of the following conditions hold :
     * * It is declared in the java.lang.invoke.MethodHandle class.
     * * It has a single formal parameter of type Object[].
     * * It has a return type of Object.
     * * It has the ACC_VARARGS and ACC_NATIVE flags set.
     */
    isSignaturePolymorphic(): boolean;
    /**
     * Retrieve the MemberName/invokedynamic JavaScript "bridge method" that
     * encapsulates the logic required to call this particular method.
     */
    getVMTargetBridgeMethod(thread: JVMThread, refKind: number): (thread: JVMThread, descriptor: string, args: any[], cb?: (e?: JVMTypes.java_lang_Throwable, rv?: any) => void) => void;
    /**
     * Generates JavaScript code for this particular method.
     * TODO: Move lock logic and such into this function! And other specialization.
     * TODO: Signature polymorphic functions...?
     */
    outputJavaScriptFunction(jsConsName: string, outStream: StringOutputStream, nonVirtualOnly?: boolean): void;
}
export declare function dumpStats(): void;
