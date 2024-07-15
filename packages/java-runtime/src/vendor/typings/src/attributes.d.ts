/// <reference types="node" />
import ByteStream from './ByteStream';
import { ConstantPool, ClassReference, IConstantPoolItem, MethodHandle, NameAndTypeInfo } from './ConstantPool';
import { StackMapTableEntryType } from './enums';
export interface IAttributeClass {
    parse(byteStream: ByteStream, constantPool: ConstantPool, attrLen: number, name: string): IAttribute;
}
export interface IAttribute {
    getName(): string;
}
export interface IInnerClassInfo {
    innerInfoIndex: number;
    outerInfoIndex: number;
    innerNameIndex: number;
    innerAccessFlags: number;
}
export declare class ExceptionHandler implements IAttribute {
    startPC: number;
    endPC: number;
    handlerPC: number;
    catchType: string;
    constructor(startPC: number, endPC: number, handlerPC: number, catchType: string);
    getName(): string;
    static parse(bytesArray: ByteStream, constantPool: ConstantPool): IAttribute;
}
export declare class Code implements IAttribute {
    private maxStack;
    private maxLocals;
    exceptionHandlers: ExceptionHandler[];
    private attrs;
    private code;
    constructor(maxStack: number, maxLocals: number, exceptionHandlers: ExceptionHandler[], attrs: IAttribute[], code: Buffer);
    getName(): string;
    getMaxStack(): number;
    static parse(byteStream: ByteStream, constantPool: ConstantPool): IAttribute;
    getCode(): NodeBuffer;
    getAttribute(name: string): IAttribute;
}
export interface ILineNumberTableEntry {
    startPC: number;
    lineNumber: number;
}
export declare class LineNumberTable implements IAttribute {
    private entries;
    constructor(entries: ILineNumberTableEntry[]);
    getName(): string;
    /**
     * Returns the relevant source code line number for the specified program
     * counter.
     */
    getLineNumber(pc: number): number;
    static parse(byteStream: ByteStream, constantPool: ConstantPool): IAttribute;
}
export declare class SourceFile implements IAttribute {
    filename: string;
    constructor(filename: string);
    getName(): string;
    static parse(byteStream: ByteStream, constantPool: ConstantPool): IAttribute;
}
export interface IStackMapTableEntry {
    type: StackMapTableEntryType;
    offsetDelta: number;
    numLocals?: number;
    locals?: string[];
    numStackItems?: number;
    stack?: string[];
    k?: number;
}
export declare class StackMapTable implements IAttribute {
    private entries;
    constructor(entries: IStackMapTableEntry[]);
    getName(): string;
    static parse(byteStream: ByteStream, constantPool: ConstantPool): IAttribute;
    private static parseEntry(byteStream, constantPool);
    private static parseVerificationTypeInfo(byteStream, constantPool);
}
export interface ILocalVariableTableEntry {
    startPC: number;
    length: number;
    name: string;
    descriptor: string;
    ref: number;
}
export declare class LocalVariableTable implements IAttribute {
    private entries;
    constructor(entries: ILocalVariableTableEntry[]);
    getName(): string;
    static parse(byteStream: ByteStream, constantPool: ConstantPool): IAttribute;
    private static parseEntries(bytes_array, constant_pool);
}
export interface ILocalVariableTypeTableEntry {
    startPC: number;
    length: number;
    name: string;
    signature: string;
    index: number;
}
export declare class LocalVariableTypeTable implements IAttribute {
    entries: ILocalVariableTypeTableEntry[];
    constructor(entries: ILocalVariableTypeTableEntry[]);
    getName(): string;
    static parse(byteStream: ByteStream, constantPool: ConstantPool): IAttribute;
    private static parseTableEntry(byteStream, constantPool);
}
export declare class Exceptions implements IAttribute {
    exceptions: string[];
    constructor(exceptions: string[]);
    getName(): string;
    static parse(byteStream: ByteStream, constantPool: ConstantPool): IAttribute;
}
export declare class InnerClasses implements IAttribute {
    classes: IInnerClassInfo[];
    constructor(classes: IInnerClassInfo[]);
    getName(): string;
    static parse(bytes_array: ByteStream, constant_pool: ConstantPool): IAttribute;
    static parseClass(byteStream: ByteStream, constantPool: ConstantPool): IInnerClassInfo;
}
export declare class ConstantValue implements IAttribute {
    value: IConstantPoolItem;
    constructor(value: IConstantPoolItem);
    getName(): string;
    static parse(bytes_array: ByteStream, constant_pool: ConstantPool): IAttribute;
}
export declare class Synthetic implements IAttribute {
    getName(): string;
    static parse(byteStream: ByteStream, constantPool: ConstantPool): IAttribute;
}
export declare class Deprecated implements IAttribute {
    getName(): string;
    static parse(byteStream: ByteStream, constantPool: ConstantPool): IAttribute;
}
export declare class Signature implements IAttribute {
    sig: string;
    constructor(sig: string);
    getName(): string;
    static parse(byteStream: ByteStream, constantPool: ConstantPool): IAttribute;
}
export declare class RuntimeVisibleAnnotations implements IAttribute {
    rawBytes: Buffer;
    isHidden: boolean;
    isCallerSensitive: boolean;
    isCompiled: boolean;
    constructor(rawBytes: Buffer, isHidden: boolean, isCallerSensitive: boolean, isCompiled: boolean);
    getName(): string;
    static parse(byteStream: ByteStream, constantPool: ConstantPool, attrLen: number): IAttribute;
}
export declare class AnnotationDefault implements IAttribute {
    rawBytes: Buffer;
    constructor(rawBytes: Buffer);
    getName(): string;
    static parse(byteStream: ByteStream, constantPool: ConstantPool, attrLen?: number): IAttribute;
}
export declare class EnclosingMethod implements IAttribute {
    encClass: ClassReference;
    /**
     * Note: Is NULL if the current class is not immediately enclosed by a method
     * or a constructor.
     */
    encMethod: NameAndTypeInfo;
    constructor(encClass: ClassReference, encMethod: NameAndTypeInfo);
    getName(): string;
    static parse(byteStream: ByteStream, constantPool: ConstantPool): IAttribute;
}
export declare class BootstrapMethods implements IAttribute {
    bootstrapMethods: Array<[MethodHandle, IConstantPoolItem[]]>;
    constructor(bootstrapMethods: Array<[MethodHandle, IConstantPoolItem[]]>);
    getName(): string;
    static parse(byteStream: ByteStream, constantPool: ConstantPool): IAttribute;
}
export declare class RuntimeVisibleParameterAnnotations implements IAttribute {
    rawBytes: Buffer;
    constructor(rawBytes: Buffer);
    getName(): string;
    static parse(byteStream: ByteStream, constantPool: ConstantPool, attrLen: number): IAttribute;
}
export declare function makeAttributes(byteStream: ByteStream, constantPool: ConstantPool): IAttribute[];
