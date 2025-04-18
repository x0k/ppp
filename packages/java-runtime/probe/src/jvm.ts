import Doppio from "doppiojvm";

import { ThreadPool } from "./threadpool";
import JVMTypes from "./vendor/includes/JVMTypes";

export type JVMThread = Doppio.VM.Threading.JVMThread;

export const {
  VM: { Util: util },
} = Doppio;

// XXX: We currently initialize these classes at JVM bootup. This is expensive.
// We should attempt to prune this list as much as possible.
const coreClasses = [
  "Ljava/lang/String;",
  "Ljava/lang/Class;",
  "Ljava/lang/ClassLoader;",
  "Ljava/lang/reflect/Constructor;",
  "Ljava/lang/reflect/Field;",
  "Ljava/lang/reflect/Method;",
  "Ljava/lang/Error;",
  "Ljava/lang/StackTraceElement;",
  "Ljava/lang/System;",
  "Ljava/lang/Thread;",
  "Ljava/lang/ThreadGroup;",
  "Ljava/lang/Throwable;",
  "Ljava/nio/ByteOrder;",
  "Lsun/misc/VM;",
  "Lsun/reflect/ConstantPool;",
  "Ljava/lang/Byte;",
  "Ljava/lang/Character;",
  "Ljava/lang/Double;",
  "Ljava/lang/Float;",
  "Ljava/lang/Integer;",
  "Ljava/lang/Long;",
  "Ljava/lang/Short;",
  "Ljava/lang/Void;",
  "Ljava/io/FileDescriptor;",
  "Ljava/lang/Boolean;",
  "[Lsun/management/MemoryManagerImpl;",
  "[Lsun/management/MemoryPoolImpl;",
  // Contains important FS constants used by natives. These constants are
  // inlined into JCL class files, so it typically never gets initialized
  // implicitly by the JVM.
  "Lsun/nio/fs/UnixConstants;",
];

export type BootstrapClassLoaderFactory = (
  javaHome: string,
  classPaths: string[],
  next: (err?: any) => void
) => Doppio.VM.ClassFile.BootstrapClassLoader;

//@ts-expect-error private method override
export class JVM extends Doppio.VM.JVM {
  public static bootstrapClassLoaderFactory: BootstrapClassLoaderFactory;

  override _initSystemProperties(
    bootstrapClasspath: string[],
    javaClassPath: string[],
    javaHomePath: string,
    tmpDir: string,
    opts: { [name: string]: string }
  ): void {
    // @ts-expect-error hack
    super._initSystemProperties(
      bootstrapClasspath,
      javaClassPath,
      javaHomePath,
      tmpDir,
      opts
    );

    let bootupTasks: { (next: (err?: any) => void): void }[] = [],
      firstThread: Doppio.VM.Threading.JVMThread,
      firstThreadObj: JVMTypes.java_lang_Thread;
    /**
     * Task #1: Initialize native methods.
     */
    bootupTasks.push((next: (err?: any) => void): void => {
      console.time("Task 1");
      //@ts-expect-error private method
      this.initializeNatives(next);
    });

    /**
     * Task #2: Construct the bootstrap class loader.
     */
    bootupTasks.push((next: (err?: any) => void): void => {
      console.timeEnd("Task 1");
      console.time("Task 2");
      //@ts-expect-error private property
      this.bsCl = JVM.bootstrapClassLoaderFactory(
        //@ts-expect-error private property
        this.systemProperties["java.home"],
        bootstrapClasspath,
        next
      );
    });

    /**
     * Task #3: Construct the thread pool, resolve thread class, and construct
     * the first thread.
     */
    bootupTasks.push((next: (err?: any) => void): void => {
      console.timeEnd("Task 2");
      console.time("Task 3");
      //@ts-expect-error private property
      this.threadPool = new ThreadPool<Doppio.VM.Threading.JVMThread>(
        (): boolean => {
          //@ts-expect-error private method
          return this.threadPoolIsEmpty();
        }
      );
      // Resolve Ljava/lang/Thread so we can fake a thread.
      // NOTE: This should never actually use the Thread object unless
      // there's an error loading java/lang/Thread and associated classes.
      //@ts-expect-error private property
      this.bsCl.resolveClass(
        null,
        "Ljava/lang/Thread;",
        (
          threadCdata: Doppio.VM.ClassFile.ReferenceClassData<JVMTypes.java_lang_Thread>
        ) => {
          if (threadCdata == null) {
            // Failed.
            next("Failed to resolve java/lang/Thread.");
          } else {
            // Construct a thread.
            // @ts-expect-error implementation error
            firstThreadObj = new (threadCdata.getConstructor(null))(null);
            firstThreadObj.$thread =
              firstThread =
              //@ts-expect-error private property
              this.firstThread =
                new Doppio.VM.Threading.JVMThread(
                  //@ts-expect-error error
                  this,
                  //@ts-expect-error private property
                  this.threadPool,
                  firstThreadObj
                );
            firstThreadObj.ref = 1;
            firstThreadObj["java/lang/Thread/priority"] = 5;
            firstThreadObj["java/lang/Thread/name"] = Doppio.VM.Util.initCarr(
              //@ts-expect-error private property
              this.bsCl,
              "main"
            );
            firstThreadObj["java/lang/Thread/blockerLock"] = new ((<
              Doppio.VM.ClassFile.ReferenceClassData<JVMTypes.java_lang_Object> //@ts-expect-error private property
            >this.bsCl.getResolvedClass("Ljava/lang/Object;")).getConstructor(firstThread))(firstThread);
            next();
          }
        }
      );
    });

    /**
     * Task #4: Preinitialize some essential JVM classes, and initializes the
     * JVM's ThreadGroup once that class is initialized.
     */
    bootupTasks.push((next: (err?: any) => void): void => {
      console.timeEnd("Task 3");
      console.time("Task 4");
      Doppio.VM.Util.asyncForEach<string>(
        coreClasses,
        (coreClass: string, nextItem: (err?: any) => void) => {
          //@ts-expect-error private property
          this.bsCl.initializeClass(
            firstThread,
            coreClass,
            (cdata: Doppio.VM.ClassFile.ClassData) => {
              if (cdata == null) {
                nextItem(`Failed to initialize ${coreClass}`);
              } else {
                // One of the later preinitialized classes references Thread.group.
                // Initialize the system's ThreadGroup now.
                if (coreClass === "Ljava/lang/ThreadGroup;") {
                  // Construct a ThreadGroup object for the first thread.
                  var threadGroupCons = (<
                      Doppio.VM.ClassFile.ReferenceClassData<JVMTypes.java_lang_ThreadGroup>
                    >cdata).getConstructor(firstThread),
                    groupObj = new threadGroupCons(firstThread);
                  groupObj["<init>()V"](
                    firstThread,
                    //@ts-expect-error implementation error
                    null,
                    (e?: JVMTypes.java_lang_Throwable) => {
                      // Tell the initial thread to use this group.
                      firstThreadObj["java/lang/Thread/group"] = groupObj;
                      nextItem(e);
                    }
                  );
                } else {
                  nextItem();
                }
              }
            }
          );
        },
        next
      );
    });

    /**
     * Task #5: Initialize the system class.
     */
    bootupTasks.push((next: (err?: any) => void): void => {
      console.timeEnd("Task 4");
      console.time("Task 5");
      // Initialize the system class (initializes things like println/etc).
      var sysInit = <typeof JVMTypes.java_lang_System>(
        (<Doppio.VM.ClassFile.ReferenceClassData<JVMTypes.java_lang_System>>(
          //@ts-expect-error private property
          this.bsCl.getInitializedClass(firstThread, "Ljava/lang/System;")
        )).getConstructor(firstThread)
      );
      sysInit["java/lang/System/initializeSystemClass()V"](
        firstThread,
        //@ts-expect-error implementation error
        null,
        (e) => {
          console.log("Task 5 callback", e);
          console.log(e?.["toString()Ljava/lang/String;"]);
          next(e);
        }
      );
    });

    /**
     * Task #6: Initialize the application's
     */
    bootupTasks.push((next: (err?: any) => void) => {
      console.timeEnd("Task 5");
      console.time("Task 6");
      var clCons = <typeof JVMTypes.java_lang_ClassLoader>(<
        Doppio.VM.ClassFile.ReferenceClassData<JVMTypes.java_lang_ClassLoader> //@ts-expect-error private property
      >this.bsCl.getInitializedClass(firstThread, "Ljava/lang/ClassLoader;")).getConstructor(firstThread);
      clCons[
        "java/lang/ClassLoader/getSystemClassLoader()Ljava/lang/ClassLoader;"
      ](
        firstThread,
        //@ts-expect-error implementation error
        null,
        (
          e?: JVMTypes.java_lang_Throwable,
          rv?: JVMTypes.java_lang_ClassLoader
        ) => {
          console.log("Task 6 callback", e, rv);
          if (e) {
            next(e);
          } else {
            if (rv === undefined) {
              next(new Error("Failed to get system class loader."));
              return;
            }
            //@ts-expect-error private property
            this.systemClassLoader = rv.$loader;
            firstThreadObj["java/lang/Thread/contextClassLoader"] = rv;

            // Initialize assertion data.
            // TODO: Is there a better way to force this? :|
            let defaultAssertionStatus =
              //@ts-expect-error private property
              this.enabledAssertions === true ? 1 : 0;
            rv["java/lang/ClassLoader/setDefaultAssertionStatus(Z)V"](
              firstThread,
              [defaultAssertionStatus],
              next
            );
          }
        }
      );
    });

    /**
     * Task #7: Initialize DoppioJVM's security provider for things like cryptographically strong RNG.
     */
    // bootupTasks.push((next: (err?: any) => void) => {
    //   console.log("Task 7")
    //   //@ts-expect-error private property
    //   this.bsCl.initializeClass(
    //     firstThread,
    //     "Ldoppio/security/DoppioProvider;",
    //     (cdata) => {
    //       next(
    //         cdata ? null : new Error(`Failed to initialize DoppioProvider.`)
    //       );
    //     }
    //   );
    // });

    // Perform bootup tasks, and then trigger the callback function.
    throw new Promise((resolve, reject) =>
      Doppio.VM.Util.asyncSeries(bootupTasks, (err?: any): void => {
        // XXX: Without setImmediate, the firstThread won't clear out the stack
        // frame that triggered us, and the firstThread won't transition to a
        // 'terminated' status.
        setTimeout(() => {
          console.timeEnd("Task 6");
          if (err) {
            //@ts-expect-error private property
            this.status = Doppio.VM.Enums.JVMStatus.TERMINATED;
            reject(err);
          } else {
            //@ts-expect-error private property
            this.status = Doppio.VM.Enums.JVMStatus.BOOTED;
            resolve(this);
          }
        });
      })
    );
  }
}

export function createJVM(
  opts: Doppio.VM.Interfaces.JVMOptions
): Promise<Doppio.VM.JVM> {
  return new Promise(
    (resolve, reject) =>
      new Doppio.VM.JVM(opts, (e, jvm) => (e ? reject(e) : resolve(jvm!)))
  );
}

const noop = () => {};

export function makeJVMFactory(
  bootstrapClassLoaderFactory: BootstrapClassLoaderFactory
) {
  JVM.bootstrapClassLoaderFactory = bootstrapClassLoaderFactory;
  return (opts: Doppio.VM.Interfaces.JVMOptions): Promise<JVM> => {
    try {
      new JVM(opts, noop);
    } catch (e) {
      if (e instanceof Promise) {
        return e;
      }
      return Promise.reject(e);
    }
    return Promise.reject(new Error("JVM creation failed"));
  };
}
