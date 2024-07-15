/// <reference types="node" />
import { ClassReference, IConstantPoolItem } from './ConstantPool';
import { ClassData } from './ClassData';
import { JVMThread, BytecodeStackFrame } from './threading';
import * as JVMTypes from '../includes/JVMTypes';
/**
 * Interface for individual opcode implementations.
 */
export interface IOpcodeImplementation {
    (thread: JVMThread, frame: BytecodeStackFrame, code?: Buffer): void;
}
/**
 * Helper function: Checks if object is null. Throws a NullPointerException
 * if it is.
 * @return True if the object is null.
 */
export declare function isNull(thread: JVMThread, frame: BytecodeStackFrame, obj: any): boolean;
/**
 * Helper function: Pops off two items, returns the second.
 */
export declare function pop2(opStack: any[]): any;
export declare function resolveCPItem(thread: JVMThread, frame: BytecodeStackFrame, cpItem: IConstantPoolItem): void;
export declare function initializeClassFromClass(thread: JVMThread, frame: BytecodeStackFrame, cls: ClassData): void;
/**
 * Helper function: Pauses the thread and initializes a class.
 */
export declare function initializeClass(thread: JVMThread, frame: BytecodeStackFrame, clsRef: ClassReference): void;
/**
 * Interrupts the current method's execution and throws an exception.
 *
 * NOTE: This does *not* interrupt JavaScript control flow, so any opcode
 * calling this function must *return* and not do anything else.
 */
export declare function throwException<T extends JVMTypes.java_lang_Throwable>(thread: JVMThread, frame: BytecodeStackFrame, clsName: string, msg: string): void;
export declare var ArrayTypes: {
    [t: number]: string;
};
/**
 * Contains definitions for all JVM opcodes.
 */
export declare class Opcodes {
    /**
     * 32-bit array load opcode
     */
    private static _aload_32(thread, frame);
    static iaload: typeof Opcodes._aload_32;
    static faload: typeof Opcodes._aload_32;
    static aaload: typeof Opcodes._aload_32;
    static baload: typeof Opcodes._aload_32;
    static caload: typeof Opcodes._aload_32;
    static saload: typeof Opcodes._aload_32;
    /**
     * 64-bit array load opcode.
     */
    private static _aload_64(thread, frame);
    static daload: typeof Opcodes._aload_64;
    static laload: typeof Opcodes._aload_64;
    /**
     * 32-bit array store.
     * @private
     */
    private static _astore_32(thread, frame);
    static iastore: typeof Opcodes._astore_32;
    static fastore: typeof Opcodes._astore_32;
    static aastore: typeof Opcodes._astore_32;
    static bastore: typeof Opcodes._astore_32;
    static castore: typeof Opcodes._astore_32;
    static sastore: typeof Opcodes._astore_32;
    /**
     * 64-bit array store.
     * @private
     */
    private static _astore_64(thread, frame);
    static lastore: typeof Opcodes._astore_64;
    static dastore: typeof Opcodes._astore_64;
    static aconst_null(thread: JVMThread, frame: BytecodeStackFrame): void;
    private static _const_0_32(thread, frame);
    private static _const_1_32(thread, frame);
    private static _const_2_32(thread, frame);
    static iconst_m1(thread: JVMThread, frame: BytecodeStackFrame): void;
    static iconst_0: typeof Opcodes._const_0_32;
    static iconst_1: typeof Opcodes._const_1_32;
    static iconst_2: typeof Opcodes._const_2_32;
    static iconst_3(thread: JVMThread, frame: BytecodeStackFrame): void;
    static iconst_4(thread: JVMThread, frame: BytecodeStackFrame): void;
    static iconst_5(thread: JVMThread, frame: BytecodeStackFrame): void;
    static fconst_0: typeof Opcodes._const_0_32;
    static fconst_1: typeof Opcodes._const_1_32;
    static fconst_2: typeof Opcodes._const_2_32;
    static lconst_0(thread: JVMThread, frame: BytecodeStackFrame): void;
    static lconst_1(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dconst_0(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dconst_1(thread: JVMThread, frame: BytecodeStackFrame): void;
    private static _load_32(thread, frame, code);
    private static _load_0_32(thread, frame);
    private static _load_1_32(thread, frame);
    private static _load_2_32(thread, frame);
    private static _load_3_32(thread, frame);
    static iload: typeof Opcodes._load_32;
    static iload_0: typeof Opcodes._load_0_32;
    static iload_1: typeof Opcodes._load_1_32;
    static iload_2: typeof Opcodes._load_2_32;
    static iload_3: typeof Opcodes._load_3_32;
    static fload: typeof Opcodes._load_32;
    static fload_0: typeof Opcodes._load_0_32;
    static fload_1: typeof Opcodes._load_1_32;
    static fload_2: typeof Opcodes._load_2_32;
    static fload_3: typeof Opcodes._load_3_32;
    static aload: typeof Opcodes._load_32;
    static aload_0: typeof Opcodes._load_0_32;
    static aload_1: typeof Opcodes._load_1_32;
    static aload_2: typeof Opcodes._load_2_32;
    static aload_3: typeof Opcodes._load_3_32;
    private static _load_64(thread, frame, code);
    private static _load_0_64(thread, frame);
    private static _load_1_64(thread, frame);
    private static _load_2_64(thread, frame);
    private static _load_3_64(thread, frame);
    static lload: typeof Opcodes._load_64;
    static lload_0: typeof Opcodes._load_0_64;
    static lload_1: typeof Opcodes._load_1_64;
    static lload_2: typeof Opcodes._load_2_64;
    static lload_3: typeof Opcodes._load_3_64;
    static dload: typeof Opcodes._load_64;
    static dload_0: typeof Opcodes._load_0_64;
    static dload_1: typeof Opcodes._load_1_64;
    static dload_2: typeof Opcodes._load_2_64;
    static dload_3: typeof Opcodes._load_3_64;
    private static _store_32(thread, frame, code);
    private static _store_0_32(thread, frame);
    private static _store_1_32(thread, frame);
    private static _store_2_32(thread, frame);
    private static _store_3_32(thread, frame);
    static istore: typeof Opcodes._store_32;
    static istore_0: typeof Opcodes._store_0_32;
    static istore_1: typeof Opcodes._store_1_32;
    static istore_2: typeof Opcodes._store_2_32;
    static istore_3: typeof Opcodes._store_3_32;
    static fstore: typeof Opcodes._store_32;
    static fstore_0: typeof Opcodes._store_0_32;
    static fstore_1: typeof Opcodes._store_1_32;
    static fstore_2: typeof Opcodes._store_2_32;
    static fstore_3: typeof Opcodes._store_3_32;
    static astore: typeof Opcodes._store_32;
    static astore_0: typeof Opcodes._store_0_32;
    static astore_1: typeof Opcodes._store_1_32;
    static astore_2: typeof Opcodes._store_2_32;
    static astore_3: typeof Opcodes._store_3_32;
    private static _store_64(thread, frame, code);
    private static _store_0_64(thread, frame);
    private static _store_1_64(thread, frame);
    private static _store_2_64(thread, frame);
    private static _store_3_64(thread, frame);
    static lstore: typeof Opcodes._store_64;
    static lstore_0: typeof Opcodes._store_0_64;
    static lstore_1: typeof Opcodes._store_1_64;
    static lstore_2: typeof Opcodes._store_2_64;
    static lstore_3: typeof Opcodes._store_3_64;
    static dstore: typeof Opcodes._store_64;
    static dstore_0: typeof Opcodes._store_0_64;
    static dstore_1: typeof Opcodes._store_1_64;
    static dstore_2: typeof Opcodes._store_2_64;
    static dstore_3: typeof Opcodes._store_3_64;
    static sipush(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static bipush(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static pop(thread: JVMThread, frame: BytecodeStackFrame): void;
    static pop2(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dup(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dup_x1(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dup_x2(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dup2(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dup2_x1(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dup2_x2(thread: JVMThread, frame: BytecodeStackFrame): void;
    static swap(thread: JVMThread, frame: BytecodeStackFrame): void;
    static iadd(thread: JVMThread, frame: BytecodeStackFrame): void;
    static ladd(thread: JVMThread, frame: BytecodeStackFrame): void;
    static fadd(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dadd(thread: JVMThread, frame: BytecodeStackFrame): void;
    static isub(thread: JVMThread, frame: BytecodeStackFrame): void;
    static fsub(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dsub(thread: JVMThread, frame: BytecodeStackFrame): void;
    static lsub(thread: JVMThread, frame: BytecodeStackFrame): void;
    static imul(thread: JVMThread, frame: BytecodeStackFrame): void;
    static lmul(thread: JVMThread, frame: BytecodeStackFrame): void;
    static fmul(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dmul(thread: JVMThread, frame: BytecodeStackFrame): void;
    static idiv(thread: JVMThread, frame: BytecodeStackFrame): void;
    static ldiv(thread: JVMThread, frame: BytecodeStackFrame): void;
    static fdiv(thread: JVMThread, frame: BytecodeStackFrame): void;
    static ddiv(thread: JVMThread, frame: BytecodeStackFrame): void;
    static irem(thread: JVMThread, frame: BytecodeStackFrame): void;
    static lrem(thread: JVMThread, frame: BytecodeStackFrame): void;
    static frem(thread: JVMThread, frame: BytecodeStackFrame): void;
    static drem(thread: JVMThread, frame: BytecodeStackFrame): void;
    static ineg(thread: JVMThread, frame: BytecodeStackFrame): void;
    static lneg(thread: JVMThread, frame: BytecodeStackFrame): void;
    static fneg(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dneg(thread: JVMThread, frame: BytecodeStackFrame): void;
    static ishl(thread: JVMThread, frame: BytecodeStackFrame): void;
    static lshl(thread: JVMThread, frame: BytecodeStackFrame): void;
    static ishr(thread: JVMThread, frame: BytecodeStackFrame): void;
    static lshr(thread: JVMThread, frame: BytecodeStackFrame): void;
    static iushr(thread: JVMThread, frame: BytecodeStackFrame): void;
    static lushr(thread: JVMThread, frame: BytecodeStackFrame): void;
    static iand(thread: JVMThread, frame: BytecodeStackFrame): void;
    static land(thread: JVMThread, frame: BytecodeStackFrame): void;
    static ior(thread: JVMThread, frame: BytecodeStackFrame): void;
    static lor(thread: JVMThread, frame: BytecodeStackFrame): void;
    static ixor(thread: JVMThread, frame: BytecodeStackFrame): void;
    static lxor(thread: JVMThread, frame: BytecodeStackFrame): void;
    static iinc(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static i2l(thread: JVMThread, frame: BytecodeStackFrame): void;
    static i2f(thread: JVMThread, frame: BytecodeStackFrame): void;
    static i2d(thread: JVMThread, frame: BytecodeStackFrame): void;
    static l2i(thread: JVMThread, frame: BytecodeStackFrame): void;
    static l2f(thread: JVMThread, frame: BytecodeStackFrame): void;
    static l2d(thread: JVMThread, frame: BytecodeStackFrame): void;
    static f2i(thread: JVMThread, frame: BytecodeStackFrame): void;
    static f2l(thread: JVMThread, frame: BytecodeStackFrame): void;
    static f2d(thread: JVMThread, frame: BytecodeStackFrame): void;
    static d2i(thread: JVMThread, frame: BytecodeStackFrame): void;
    static d2l(thread: JVMThread, frame: BytecodeStackFrame): void;
    static d2f(thread: JVMThread, frame: BytecodeStackFrame): void;
    static i2b(thread: JVMThread, frame: BytecodeStackFrame): void;
    static i2c(thread: JVMThread, frame: BytecodeStackFrame): void;
    static i2s(thread: JVMThread, frame: BytecodeStackFrame): void;
    static lcmp(thread: JVMThread, frame: BytecodeStackFrame): void;
    static fcmpl(thread: JVMThread, frame: BytecodeStackFrame): void;
    static fcmpg(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dcmpl(thread: JVMThread, frame: BytecodeStackFrame): void;
    static dcmpg(thread: JVMThread, frame: BytecodeStackFrame): void;
    static ifeq(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static ifne(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static iflt(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static ifge(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static ifgt(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static ifle(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static if_icmpeq(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static if_icmpne(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static if_icmplt(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static if_icmpge(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static if_icmpgt(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static if_icmple(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static if_acmpeq(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static if_acmpne(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static goto(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static jsr(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static ret(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static tableswitch(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static lookupswitch(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static return(thread: JVMThread, frame: BytecodeStackFrame): void;
    private static _return_32(thread, frame);
    static ireturn: typeof Opcodes._return_32;
    static freturn: typeof Opcodes._return_32;
    static areturn: typeof Opcodes._return_32;
    private static _return_64(thread, frame);
    static lreturn: typeof Opcodes._return_64;
    static dreturn: typeof Opcodes._return_64;
    static getstatic(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    /**
     * A fast version of getstatic that assumes that relevant classes are
     * initialized.
     *
     * Retrieves a 32-bit value.
     */
    static getstatic_fast32(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    /**
     * A fast version of getstatic that assumes that relevant classes are
     * initialized.
     *
     * Retrieves a 64-bit value.
     */
    static getstatic_fast64(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static putstatic(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    /**
     * A fast version of putstatic that assumes that relevant classes are
     * initialized.
     *
     * Puts a 32-bit value.
     */
    static putstatic_fast32(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    /**
     * A fast version of putstatic that assumes that relevant classes are
     * initialized.
     *
     * Puts a 64-bit value.
     */
    static putstatic_fast64(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static getfield(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static getfield_fast32(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static getfield_fast64(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static putfield(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static putfield_fast32(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static putfield_fast64(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static invokevirtual(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static invokeinterface(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static invokedynamic(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    /**
     * XXX: Actually perform superclass method lookup.
     */
    static invokespecial(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static invokestatic(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static invokenonvirtual_fast(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static invokestatic_fast(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static invokevirtual_fast(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static invokeinterface_fast: typeof Opcodes.invokevirtual_fast;
    static invokedynamic_fast(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    /**
     * Opcode for MethodHandle.invoke and MethodHandle.invokeExact.
     */
    static invokehandle(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    /**
     * Opcode for MethodHandle.invokeBasic.
     * Unlike invoke/invokeExact, invokeBasic does not call a generated bytecode
     * method. It calls the vmtarget embedded in the MethodHandler directly.
     * This can cause crashes with malformed calls, thus it is only accesssible
     * to trusted JDK code.
     */
    static invokebasic(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    /**
     * Also used for linkToStatic.
     * TODO: De-conflate the two.
     * TODO: Varargs functions.
     */
    static linktospecial(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static linktovirtual(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static breakpoint(thread: JVMThread, frame: BytecodeStackFrame): void;
    static new(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static new_fast(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static newarray(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static anewarray(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static anewarray_fast(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static arraylength(thread: JVMThread, frame: BytecodeStackFrame): void;
    static athrow(thread: JVMThread, frame: BytecodeStackFrame): void;
    static checkcast(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static checkcast_fast(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static instanceof(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static instanceof_fast(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static monitorenter(thread: JVMThread, frame: BytecodeStackFrame): void;
    static monitorexit(thread: JVMThread, frame: BytecodeStackFrame): void;
    static multianewarray(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static multianewarray_fast(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static ifnull(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static ifnonnull(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static goto_w(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static jsr_w(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static nop(thread: JVMThread, frame: BytecodeStackFrame): void;
    static ldc(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static ldc_w(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static ldc2_w(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
    static wide(thread: JVMThread, frame: BytecodeStackFrame, code: Buffer): void;
}
export declare var LookupTable: IOpcodeImplementation[];
