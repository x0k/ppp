/**
 * A class can be in one of these states at any given point in time.
 */
export declare enum ClassState {
    NOT_LOADED = 0,
    LOADED = 1,
    RESOLVED = 2,
    INITIALIZED = 3,
}
/**
 * A thread can be in one of these states at any given point in time.
 *
 * NOTE: When altering ThreadStatus, remember to update the following things.
 *
 * - Thread.validTransitions: Describes each valid thread transition.
 * - sun.misc.VM.getThreadStateValues: Maps ThreadStatus values to Thread.State
 *   values.
 * - Assertion statements in Thread regarding its status.
 */
export declare enum ThreadStatus {
    NEW = 0,
    RUNNABLE = 1,
    BLOCKED = 2,
    UNINTERRUPTABLY_BLOCKED = 3,
    WAITING = 4,
    TIMED_WAITING = 5,
    ASYNC_WAITING = 6,
    PARKED = 7,
    TERMINATED = 8,
}
/**
 * Java-visible thread state values.
 */
export declare enum JVMTIThreadState {
    ALIVE = 1,
    TERMINATED = 2,
    RUNNABLE = 4,
    BLOCKED_ON_MONITOR_ENTER = 1024,
    WAITING_INDEFINITELY = 16,
    WAITING_WITH_TIMEOUT = 32,
}
/**
 * Three-state boolean.
 */
export declare enum TriState {
    TRUE = 0,
    FALSE = 1,
    INDETERMINATE = 2,
}
/**
 * The current status of the JVM.
 */
export declare enum JVMStatus {
    BOOTING = 0,
    BOOTED = 1,
    RUNNING = 2,
    TERMINATING = 3,
    TERMINATED = 4,
}
/**
 * Indicates the type of a stack frame.
 */
export declare enum StackFrameType {
    /**
     * A JVM internal stack frame. These should be completely invisible to the
     * JVM program.
     */
    INTERNAL = 0,
    /**
     * A bytecode method's stack frame. These have an actual stack.
     */
    BYTECODE = 1,
    /**
     * A native method's stack frame. These typically consist of just a JavaScript
     * function and a method association.
     */
    NATIVE = 2,
}
/**
 * Various constant values. Enum'd so they are inlined by the TypeScript
 * compiler.
 */
export declare enum Constants {
    INT_MAX,
    INT_MIN,
    FLOAT_POS_INFINITY,
    FLOAT_NEG_INFINITY,
    FLOAT_POS_INFINITY_AS_INT = 2139095040,
    FLOAT_NEG_INFINITY_AS_INT = -8388608,
    FLOAT_NaN_AS_INT = 2143289344,
}
/**
 * Integer indicating the type of a constant pool item.
 * @url https://docs.oracle.com/javase/specs/jvms/se7/html/jvms-4.html#jvms-4.4-140
 */
export declare enum ConstantPoolItemType {
    CLASS = 7,
    FIELDREF = 9,
    METHODREF = 10,
    INTERFACE_METHODREF = 11,
    STRING = 8,
    INTEGER = 3,
    FLOAT = 4,
    LONG = 5,
    DOUBLE = 6,
    NAME_AND_TYPE = 12,
    UTF8 = 1,
    METHOD_HANDLE = 15,
    METHOD_TYPE = 16,
    INVOKE_DYNAMIC = 18,
}
/**
 * Integer indicating the type of a StackMapTable entry.
 * @see https://docs.oracle.com/javase/specs/jvms/se7/html/jvms-4.html#jvms-4.7.4
 */
export declare enum StackMapTableEntryType {
    SAME_FRAME = 0,
    SAME_LOCALS_1_STACK_ITEM_FRAME = 1,
    SAME_LOCALS_1_STACK_ITEM_FRAME_EXTENDED = 2,
    CHOP_FRAME = 3,
    SAME_FRAME_EXTENDED = 4,
    APPEND_FRAME = 5,
    FULL_FRAME = 6,
}
/**
 * Integer indicating the reference type of a MethodHandle item in the constant
 * pool.
 * @see https://docs.oracle.com/javase/specs/jvms/se7/html/jvms-4.html#jvms-4.4.8
 */
export declare enum MethodHandleReferenceKind {
    GETFIELD = 1,
    GETSTATIC = 2,
    PUTFIELD = 3,
    PUTSTATIC = 4,
    INVOKEVIRTUAL = 5,
    INVOKESTATIC = 6,
    INVOKESPECIAL = 7,
    NEWINVOKESPECIAL = 8,
    INVOKEINTERFACE = 9,
}
/**
 * JVM op codes. The enum value corresponds to that opcode's value.
 */
export declare enum OpCode {
    AALOAD = 50,
    AASTORE = 83,
    ACONST_NULL = 1,
    ALOAD = 25,
    ALOAD_0 = 42,
    ALOAD_1 = 43,
    ALOAD_2 = 44,
    ALOAD_3 = 45,
    ANEWARRAY = 189,
    ARETURN = 176,
    ARRAYLENGTH = 190,
    ASTORE = 58,
    ASTORE_0 = 75,
    ASTORE_1 = 76,
    ASTORE_2 = 77,
    ASTORE_3 = 78,
    ATHROW = 191,
    BALOAD = 51,
    BASTORE = 84,
    BIPUSH = 16,
    BREAKPOINT = 202,
    CALOAD = 52,
    CASTORE = 85,
    CHECKCAST = 192,
    D2F = 144,
    D2I = 142,
    D2L = 143,
    DADD = 99,
    DALOAD = 49,
    DASTORE = 82,
    DCMPG = 152,
    DCMPL = 151,
    DCONST_0 = 14,
    DCONST_1 = 15,
    DDIV = 111,
    DLOAD = 24,
    DLOAD_0 = 38,
    DLOAD_1 = 39,
    DLOAD_2 = 40,
    DLOAD_3 = 41,
    DMUL = 107,
    DNEG = 119,
    DREM = 115,
    DRETURN = 175,
    DSTORE = 57,
    DSTORE_0 = 71,
    DSTORE_1 = 72,
    DSTORE_2 = 73,
    DSTORE_3 = 74,
    DSUB = 103,
    DUP = 89,
    DUP_X1 = 90,
    DUP_X2 = 91,
    DUP2 = 92,
    DUP2_X1 = 93,
    DUP2_X2 = 94,
    F2D = 141,
    F2I = 139,
    F2L = 140,
    FADD = 98,
    FALOAD = 48,
    FASTORE = 81,
    FCMPG = 150,
    FCMPL = 149,
    FCONST_0 = 11,
    FCONST_1 = 12,
    FCONST_2 = 13,
    FDIV = 110,
    FLOAD = 23,
    FLOAD_0 = 34,
    FLOAD_1 = 35,
    FLOAD_2 = 36,
    FLOAD_3 = 37,
    FMUL = 106,
    FNEG = 118,
    FREM = 114,
    FRETURN = 174,
    FSTORE = 56,
    FSTORE_0 = 67,
    FSTORE_1 = 68,
    FSTORE_2 = 69,
    FSTORE_3 = 70,
    FSUB = 102,
    GETFIELD = 180,
    GETSTATIC = 178,
    GOTO = 167,
    GOTO_W = 200,
    I2B = 145,
    I2C = 146,
    I2D = 135,
    I2F = 134,
    I2L = 133,
    I2S = 147,
    IADD = 96,
    IALOAD = 46,
    IAND = 126,
    IASTORE = 79,
    ICONST_M1 = 2,
    ICONST_0 = 3,
    ICONST_1 = 4,
    ICONST_2 = 5,
    ICONST_3 = 6,
    ICONST_4 = 7,
    ICONST_5 = 8,
    IDIV = 108,
    IF_ACMPEQ = 165,
    IF_ACMPNE = 166,
    IF_ICMPEQ = 159,
    IF_ICMPGE = 162,
    IF_ICMPGT = 163,
    IF_ICMPLE = 164,
    IF_ICMPLT = 161,
    IF_ICMPNE = 160,
    IFEQ = 153,
    IFGE = 156,
    IFGT = 157,
    IFLE = 158,
    IFLT = 155,
    IFNE = 154,
    IFNONNULL = 199,
    IFNULL = 198,
    IINC = 132,
    ILOAD = 21,
    ILOAD_0 = 26,
    ILOAD_1 = 27,
    ILOAD_2 = 28,
    ILOAD_3 = 29,
    IMUL = 104,
    INEG = 116,
    INSTANCEOF = 193,
    INVOKEDYNAMIC = 186,
    INVOKEINTERFACE = 185,
    INVOKESPECIAL = 183,
    INVOKESTATIC = 184,
    INVOKEVIRTUAL = 182,
    IOR = 128,
    IREM = 112,
    IRETURN = 172,
    ISHL = 120,
    ISHR = 122,
    ISTORE = 54,
    ISTORE_0 = 59,
    ISTORE_1 = 60,
    ISTORE_2 = 61,
    ISTORE_3 = 62,
    ISUB = 100,
    IUSHR = 124,
    IXOR = 130,
    JSR = 168,
    JSR_W = 201,
    L2D = 138,
    L2F = 137,
    L2I = 136,
    LADD = 97,
    LALOAD = 47,
    LAND = 127,
    LASTORE = 80,
    LCMP = 148,
    LCONST_0 = 9,
    LCONST_1 = 10,
    LDC = 18,
    LDC_W = 19,
    LDC2_W = 20,
    LDIV = 109,
    LLOAD = 22,
    LLOAD_0 = 30,
    LLOAD_1 = 31,
    LLOAD_2 = 32,
    LLOAD_3 = 33,
    LMUL = 105,
    LNEG = 117,
    LOOKUPSWITCH = 171,
    LOR = 129,
    LREM = 113,
    LRETURN = 173,
    LSHL = 121,
    LSHR = 123,
    LSTORE = 55,
    LSTORE_0 = 63,
    LSTORE_1 = 64,
    LSTORE_2 = 65,
    LSTORE_3 = 66,
    LSUB = 101,
    LUSHR = 125,
    LXOR = 131,
    MONITORENTER = 194,
    MONITOREXIT = 195,
    MULTIANEWARRAY = 197,
    NEW = 187,
    NEWARRAY = 188,
    NOP = 0,
    POP = 87,
    POP2 = 88,
    PUTFIELD = 181,
    PUTSTATIC = 179,
    RET = 169,
    RETURN = 177,
    SALOAD = 53,
    SASTORE = 86,
    SIPUSH = 17,
    SWAP = 95,
    TABLESWITCH = 170,
    WIDE = 196,
    GETSTATIC_FAST32 = 208,
    GETSTATIC_FAST64 = 209,
    NEW_FAST = 210,
    ANEWARRAY_FAST = 213,
    CHECKCAST_FAST = 214,
    INSTANCEOF_FAST = 215,
    MULTIANEWARRAY_FAST = 216,
    PUTSTATIC_FAST32 = 217,
    PUTSTATIC_FAST64 = 218,
    GETFIELD_FAST32 = 219,
    GETFIELD_FAST64 = 220,
    PUTFIELD_FAST32 = 221,
    PUTFIELD_FAST64 = 222,
    INVOKENONVIRTUAL_FAST = 223,
    INVOKESTATIC_FAST = 240,
    INVOKEVIRTUAL_FAST = 241,
    INVOKEINTERFACE_FAST = 242,
    INVOKEHANDLE = 243,
    INVOKEBASIC = 244,
    LINKTOSPECIAL = 245,
    LINKTOVIRTUAL = 247,
    INVOKEDYNAMIC_FAST = 248,
}
export declare enum OpcodeLayoutType {
    OPCODE_ONLY = 0,
    CONSTANT_POOL_UINT8 = 1,
    CONSTANT_POOL = 2,
    CONSTANT_POOL_AND_UINT8_VALUE = 3,
    UINT8_VALUE = 4,
    UINT8_AND_INT8_VALUE = 5,
    INT8_VALUE = 6,
    INT16_VALUE = 7,
    INT32_VALUE = 8,
    ARRAY_TYPE = 9,
    WIDE = 10,
}
export declare var OpcodeLayouts: OpcodeLayoutType[];
