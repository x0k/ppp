/// <reference types="node" />
import { Flags } from './util';
import { ConstantPool, ClassReference, MethodHandle, IConstantPoolItem } from './ConstantPool';
import { IAttribute } from './attributes';
import { JVMThread } from './threading';
import { Method, Field } from './methods';
import { ClassLoader } from './ClassLoader';
import { ClassState } from './enums';
import StringOutputStream from './StringOutputStream';
import * as JVMTypes from '../includes/JVMTypes';
export interface IJVMConstructor<T extends JVMTypes.java_lang_Object> {
    /**
     * Constructs a new object in the same manner as the JVM's "new" opcode.
     * Does *NOT* run the JVM constructor!
     * @param jvm The thread that is constructing the object.
     * @param lengths... If this is an array type, the length of each dimension of the array. (Required if an array type.)
     */
    new (thread: JVMThread, lengths?: number[] | number): T;
}
/**
 * Represents a single class in the JVM.
 */
export declare abstract class ClassData {
    protected loader: ClassLoader;
    accessFlags: Flags;
    /**
     * We make this private to *enforce* call sites to use our getter functions.
     * The actual state of this class depends on the state of its parents, and
     * parents do not inform their children when they change state.
     */
    private state;
    private jco;
    /**
     * The class's canonical name, in internal form.
     * Ljava/lang/Foo;
     */
    protected className: string;
    protected superClass: ReferenceClassData<JVMTypes.java_lang_Object>;
    /**
     * Responsible for setting up all of the fields that are guaranteed to be
     * present on any ClassData object.
     */
    constructor(loader: ClassLoader);
    /**
     * Get the external form of this class's name (e.g. java.lang.String).
     */
    getExternalName(): string;
    /**
     * Get the internal form of this class's name (e.g. Ljava/lang/String;).
     */
    getInternalName(): string;
    /**
     * Get the name of the package that this class belongs to (e.g. java.lang).
     */
    getPackageName(): string;
    /**
     * Returns the ClassLoader object of the classloader that initialized this
     * class. Returns null for the default classloader.
     */
    getLoader(): ClassLoader;
    /**
     * Get the class's super class, which is always going to be a reference
     * class.
     */
    getSuperClass(): ReferenceClassData<JVMTypes.java_lang_Object>;
    /**
     * Get all of the interfaces that the class implements.
     */
    getInterfaces(): ReferenceClassData<JVMTypes.java_lang_Object>[];
    /**
     * Get all of the injected fields for this class. The value for each field
     * in the returned map is its type.
     */
    getInjectedFields(): {
        [fieldName: string]: string;
    };
    /**
     * Get all of the injected methods for this class. The value for each method
     * in the returned map is its type.
     */
    getInjectedMethods(): {
        [methodName: string]: string;
    };
    /**
     * Get all of the injected static methods for this class. The value for each
     * method in the returned map is its type.
     */
    getInjectedStaticMethods(): {
        [methodName: string]: string;
    };
    /**
     * Get a java.lang.Class object corresponding to this class.
     */
    getClassObject(thread: JVMThread): JVMTypes.java_lang_Class;
    /**
     * Get the protection domain of this class.
     * This value is NULL for all but reference classes loaded by app classloaders.
     */
    getProtectionDomain(): JVMTypes.java_security_ProtectionDomain;
    /**
     * Retrieves the method defined in this particular class by the given method
     * signature *without* invoking method lookup.
     * @param methodSignature The method's full signature, e.g. <clinit>()V
     */
    getMethod(methodSignature: string): Method;
    /**
     * Retrieve all of the methods defined on this class.
     */
    getMethods(): Method[];
    /**
     * Retrieve the set of fields defined on this class.
     */
    getFields(): Field[];
    /**
     * Attempt to synchronously resolve this class using its loader. Should only
     * be called on ClassData in the LOADED state.
     */
    abstract tryToResolve(): boolean;
    /**
     * Attempt to synchronously initialize this class.
     */
    abstract tryToInitialize(): boolean;
    /**
     * Set the state of this particular class to LOADED/RESOLVED/INITIALIZED.
     */
    setState(state: ClassState): void;
    /**
     * Gets the current state of this class.
     */
    protected getState(): ClassState;
    /**
     * Check if the class is initialized.
     * @param thread The thread that is performing the check. If initialization
     *   is in progress on that thread, then the class is, for all intents and
     *   purposes, initialized.
     */
    isInitialized(thread: JVMThread): boolean;
    isResolved(): boolean;
    isSubinterface(target: ClassData): boolean;
    isSubclass(target: ClassData): boolean;
    abstract isCastable(target: ClassData): boolean;
    resolve(thread: JVMThread, cb: (cdata: ClassData) => void, explicit?: boolean): void;
    initialize(thread: JVMThread, cb: (cdata: ClassData) => void, explicit?: boolean): void;
    protected outputInjectedMethods(jsClassName: string, outputStream: StringOutputStream): void;
}
export declare class PrimitiveClassData extends ClassData {
    constructor(className: string, loader: ClassLoader);
    /**
     * Returns a boolean indicating if this class is an instance of the target class.
     * "target" is a ClassData object.
     * The ClassData objects do not need to be initialized; just loaded.
     */
    isCastable(target: ClassData): boolean;
    /**
     * Returns the internal class name for the corresponding boxed type.
     */
    boxClassName(): string;
    /**
     * Returns a boxed version of the given primitive.
     */
    createWrapperObject(thread: JVMThread, value: any): JVMTypes.java_lang_Object;
    tryToResolve(): boolean;
    tryToInitialize(): boolean;
    /**
     * Primitive classes are already resolved.
     */
    resolve(thread: JVMThread, cb: (cdata: ClassData) => void, explicit?: boolean): void;
}
export declare class ArrayClassData<T> extends ClassData {
    private componentClassName;
    private componentClass;
    private _constructor;
    constructor(componentType: string, loader: ClassLoader);
    /**
     * Looks up a method with the given signature. Returns null if no method
     * found.
     */
    methodLookup(signature: string): Method;
    fieldLookup(name: string): Field;
    /**
     * Resolve the class.
     */
    resolve(thread: JVMThread, cb: (cdata: ClassData) => void, explicit?: boolean): void;
    getComponentClass(): ClassData;
    /**
     * Resolved and initialized are the same for array types.
     */
    setResolved<T extends JVMTypes.java_lang_Object>(super_class_cdata: ReferenceClassData<T>, component_class_cdata: ClassData): void;
    tryToResolve(): boolean;
    tryToInitialize(): boolean;
    /**
     * Returns a boolean indicating if this class is an instance of the target class.
     * "target" is a ClassData object.
     * The ClassData objects do not need to be initialized; just loaded.
     * See §2.6.7 for casting rules.
     */
    isCastable(target: ClassData): boolean;
    initialize(thread: JVMThread, cb: (cdata: ClassData) => void, explicit?: boolean): void;
    /**
     * Get the array constructor for this particular JVM array class.
     * Uses typed arrays when available for primitive arrays.
     */
    private getJSArrayConstructor();
    /**
     * Get the initial value placed into each array element.
     */
    private getJSDefaultArrayElement();
    /**
     * Creates a specialized `slice` method that creates a shallow slice of this
     * array. Specialized to the type of array (JS or Typed).
     */
    private _getSliceMethod();
    private _constructConstructor(thread);
    getConstructor(thread: JVMThread): IJVMConstructor<JVMTypes.JVMArray<T>>;
}
/**
 * Represents a "reference" Class -- that is, a class that neither represents a
 * primitive nor an array.
 */
export declare class ReferenceClassData<T extends JVMTypes.java_lang_Object> extends ClassData {
    private minorVersion;
    majorVersion: number;
    constantPool: ConstantPool;
    /**
     * All of the fields directly defined by this class.
     */
    private fields;
    /**
     * All of the methods directly defined by this class.
     */
    private methods;
    private attrs;
    private interfaceClasses;
    private superClassRef;
    private interfaceRefs;
    /**
     * Initialization lock.
     */
    private initLock;
    /**
     * Stores the JavaScript constructor for this class.
     */
    private _constructor;
    /**
     * Virtual field table
     */
    private _fieldLookup;
    /**
     * All fields in object instantiations. Fields from super classes are in front
     * of fields from this class. A field's offset in the array is its *vmindex*.
     */
    protected _objectFields: Field[];
    /**
     * All static fields in this particular class. The field's offset in this
     * array is its *vmindex*.
     */
    protected _staticFields: Field[];
    /**
     * Virtual method table, keyed by method signature. Unlike _vmTable,
     * _methodLookup contains static methods and constructors, too.
     */
    private _methodLookup;
    /**
     * Virtual method table, keyed by vmindex. Methods originally defined by
     * super classes are in front of methods defined in this class. Overriding
     * methods are placed into the vmindex of the originating method.
     */
    protected _vmTable: Method[];
    /**
     * Default method implementations that this class did *not* inherit, but are
     * still invocable in the class via their full name (e.g. through an
     * invokespecial bytecode).
     */
    protected _uninheritedDefaultMethods: Method[];
    /**
     * The ProtectionDomain for this class, specified by the application class
     * loader. NULL for bootstrap classloaded items.
     */
    protected _protectionDomain: JVMTypes.java_security_ProtectionDomain;
    constructor(buffer: Buffer, protectionDomain?: JVMTypes.java_security_ProtectionDomain, loader?: ClassLoader, cpPatches?: JVMTypes.JVMArray<JVMTypes.java_lang_Object>);
    getSuperClassReference(): ClassReference;
    getInterfaceClassReferences(): ClassReference[];
    /**
     * Retrieve the set of interfaces that this class implements.
     * DO NOT MUTATE!
     */
    getInterfaces(): ReferenceClassData<JVMTypes.java_lang_Object>[];
    /**
     * The set of fields that this class has.
     * DO NOT MUTATE!
     */
    getFields(): Field[];
    /**
     * Get the Virtual Method table for this class.
     */
    getVMTable(): Method[];
    /**
     * Returns the VM index for the given method. Returns -1 if not present in the
     * virtual method table (e.g. is static or a constructor).
     */
    getVMIndexForMethod(m: Method): number;
    /**
     * Returns the method corresponding to the given VMIndex.
     */
    getMethodFromVMIndex(i: number): Method;
    /**
     * Get the VM index for the given field
     * NOTE: A static and non-static field can have the same vmindex! Caller must
     * be able to differentiate between static and non-static behavior!
     */
    getVMIndexForField(f: Field): number;
    getStaticFieldFromVMIndex(index: number): Field;
    getObjectFieldFromVMIndex(index: number): Field;
    /**
     * Get a field from its "slot". A "slot" is just the field's index in its
     * defining class's field array.
     */
    getFieldFromSlot(slot: number): Field;
    /**
     * Get a method from its "slot". A "slot" is just the method's index in its
     * defining class's method array.
     */
    getMethodFromSlot(slot: number): Method;
    /**
     * Retrieve a method with the given signature from this particular class.
     * Does not search superclasses / interfaces.
     */
    getMethod(sig: string): Method;
    getSpecificMethod(definingCls: string, sig: string): Method;
    /**
     * Get the methods belonging to this particular class.
     * DO NOT MUTATE!
     */
    getMethods(): Method[];
    /**
     * Get the set of default methods that are invocable on this object, but were
     * not inherited in the virtual method table.
     * DO NOT MUTATE!
     */
    getUninheritedDefaultMethods(): Method[];
    getProtectionDomain(): JVMTypes.java_security_ProtectionDomain;
    /**
     * Resolves this class's virtual method table according to the JVM
     * specification:
     * http://docs.oracle.com/javase/specs/jvms/se8/html/jvms-5.html#jvms-5.4.3.3
     */
    private _resolveMethods();
    /**
     * Resolves all of the fields for this class according to the JVM
     * specification:
     * http://docs.oracle.com/javase/specs/jvms/se8/html/jvms-5.html#jvms-5.4.3.2
     */
    private _resolveFields();
    /**
     * Looks up a method with the given signature. Returns null if no method
     * found.
     */
    methodLookup(signature: string): Method;
    /**
     * Performs method lookup, and includes signature polymorphic results if
     * the method is signature polymorphic.
     */
    signaturePolymorphicAwareMethodLookup(signature: string): Method;
    /**
     * Looks up a field with the given name. Returns null if no method found.
     */
    fieldLookup(name: string): Field;
    getAttribute(name: string): IAttribute;
    getAttributes(name: string): IAttribute[];
    /**
     * Get the bootstrap method information for an InvokeDynamic opcode.
     */
    getBootstrapMethod(idx: number): [MethodHandle, IConstantPoolItem[]];
    /**
     * Returns the initial value for a given static field in the class. Should
     * only be called when the constructor is created.
     */
    private _getInitialStaticFieldValue(thread, name);
    setResolved(superClazz: ReferenceClassData<JVMTypes.java_lang_Object>, interfaceClazzes: ReferenceClassData<JVMTypes.java_lang_Object>[]): void;
    tryToResolve(): boolean;
    /**
     * Attempt to synchronously initialize. This is possible if there is no
     * static initializer, and the parent classes are properly initialized.
     */
    tryToInitialize(): boolean;
    /**
     * Returns a boolean indicating if this class is an instance of the target class.
     * "target" is a ClassData object.
     * The ClassData objects do not need to be initialized; just loaded.
     * See §2.6.7 for casting rules.
     * @todo Determine this statically to make this a constant time operation.
     */
    isCastable(target: ClassData): boolean;
    /**
     * Returns 'true' if I implement the target interface.
     */
    isSubinterface(target: ClassData): boolean;
    /**
     * Asynchronously *initializes* the class and its super classes.
     * Throws a Java exception on the thread if initialization fails.
     * @param thread The thread that is performing the initialization.
     * @param cb Callback to invoke when completed. Contains a reference to the
     *   class if it succeeds, or NULL if a failure occurs.
     * @param [explicit] Defaults to true. If true, this class is being
     *   *explicitly* initialized by a user. If false, the JVM is implicitly
     *   initializing the class.
     */
    initialize(thread: JVMThread, cb: (cdata: ClassData) => void, explicit?: boolean): void;
    /**
     * Helper function. Initializes this class alone. Assumes super class is
     * already initialized.
     */
    private _initialize(thread, cb);
    /**
     * A reference class can be treated as initialized in a thread if that thread
     * is in the process of initializing it.
     */
    isInitialized(thread: JVMThread): boolean;
    /**
     * Resolve the class.
     */
    resolve(thread: JVMThread, cb: (cdata: ClassData) => void, explicit?: boolean): void;
    /**
     * Find Miranda and default interface methods in this class. These
     * methods manifest as new vmindices in the virtual method table compared with
     * the superclass, and are not defined in this class itself.
     */
    getMirandaAndDefaultMethods(): Method[];
    outputInjectedFields(outputStream: StringOutputStream): void;
    protected _constructConstructor(thread: JVMThread): IJVMConstructor<T>;
    getConstructor(thread: JVMThread): IJVMConstructor<T>;
}
