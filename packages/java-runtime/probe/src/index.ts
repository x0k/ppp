import BrowserFS from "browserfs";

// import { makeJVMFactory } from "./jvm";
import { createJVM, util, JVMThread } from "./jvm";
import { initFs, ls } from "./fs";
//@ts-ignore
import javaCode from "./Probe.java?raw";
// import { makeBootstrapClassLoaderFactory } from './bootstap-class-loader';

const data = await fetch("/doppio.zip").then((res) => res.arrayBuffer());

const fs = await initFs(data);

console.time("Run");

ls("/sys");

// const createJVM = makeJVMFactory(
//   makeBootstrapClassLoaderFactory(new Map())
// )

let jvm = await createJVM({
  doppioHomePath: "/sys",
  classpath: ["/home", "/sys/classes"],
});

console.log(jvm);

// Grab BrowserFS's 'process' module, which emulates NodeJS's process.
var process = BrowserFS.BFSRequire("process");
// Initialize TTYs; required if needed to be initialized immediately due to
// circular dependency issue.
// See: https://github.com/jvilk/bfs-process#stdinstdoutstderr
// process.initializeTTYs();
process.stdout.on("data", function (data) {
  // data is a Node Buffer, which BrowserFS implements in the browser.
  // http://nodejs.org/api/buffer.html
  console.log(data.toString());
});
process.stderr.on("data", function (data) {
  // data is a Node Buffer, which BrowserFS implements in the browser.
  // http://nodejs.org/api/buffer.html
  console.log(data.toString());
});
// Write text to standard in.
// process.stdin.write('Some text');

fs.writeFileSync("/home/Probe.java", javaCode);

await new Promise((resolve, reject) =>
  jvm.runClass("util.Javac", ["/home/Probe.java"], (code) => {
    if (code === 0) {
      resolve(0);
    } else {
      reject(code);
    }
  })
);

ls("/home");

jvm = await createJVM({
  doppioHomePath: "/sys",
  classpath: ["/home", "/sys/classes"],
});

jvm.registerNatives({
  Probe: {
    "getStringArg()Ljava/lang/String;": function (
      thread: JVMThread
    ) {
      return util.initString(thread.getBsCl(), "FRIDAY");
    },
    "saveNumber(I)V": function (thread: JVMThread, arg0: number) {
      console.log("Number: ", arg0);
    },
    "saveString(Ljava/lang/String;)V": function (
      thread: JVMThread,
      arg0: string
    ) {
      console.log("String: ", arg0.toString());
    },
    "saveArray([I)V": function (
      thread: JVMThread,
      arg0: number[]
    ) {
      console.log("Array: ", arg0);
    },
    "saveEnum(LDayOfWeek;)V": function (
      thread: JVMThread,
      arg0: object
    ) {
      console.log("Enum: ", arg0);
    },
  },
});

await new Promise((resolve, reject) =>
  jvm.runClass("Probe", [], (code) => {
    if (code === 0) {
      resolve(0);
    } else {
      reject(code);
    }
  })
);

console.timeEnd("Run");

ls("/home");
