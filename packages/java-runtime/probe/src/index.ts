import * as BrowserFS from "browserfs";
import * as async from "async";

// import { makeJVMFactory } from "./jvm";
import { createJVM } from "./jvm";
//@ts-ignore
import javaCode from "./Probe.java?raw";
// import { makeBootstrapClassLoaderFactory } from './bootstap-class-loader';

const path = BrowserFS.BFSRequire("path");
const fs = BrowserFS.BFSRequire("fs");
const { Buffer } = BrowserFS.BFSRequire("buffer");

function copyFile(srcFile: string, destFile: string, cb: (err?: any) => void) {
  fs.readFile(srcFile, (e: any, data?: Buffer) => {
    if (e) {
      cb(e);
    } else {
      fs.writeFile(destFile, data, cb);
    }
  });
}

function recursiveCopy(
  srcFolder: string,
  destFolder: string,
  cb: (err?: any) => void
): void {
  function processDir(
    srcFolder: string,
    destFolder: string,
    cb: (err?: any) => void
  ) {
    fs.mkdir(destFolder, (err?: NodeJS.ErrnoException) => {
      // Ignore EEXIST.
      if (err && err.code !== "EEXIST") {
        cb(err);
      } else {
        fs.readdir(srcFolder, (e, items) => {
          if (e) {
            cb(e);
          } else {
            async.each(
              items!,
              // @ts-expect-error
              (item, next) => {
                var srcItem = path.resolve(srcFolder, item),
                  destItem = path.resolve(destFolder, item);
                fs.stat(srcItem, (e, stat) => {
                  if (e) {
                    cb(e);
                  } else {
                    if (stat!.isDirectory()) {
                      processDir(srcItem, destItem, next);
                    } else {
                      copyFile(srcItem, destItem, next);
                    }
                  }
                });
              },
              cb
            );
          }
        });
      }
    });
  }
  processDir(srcFolder, destFolder, cb);
}

await fetch("/doppio.zip")
  .then((res) => res.arrayBuffer())
  .then(
    (data) =>
      new Promise<void>((resolve, reject) =>
        BrowserFS.configure(
          {
            fs: "MountableFileSystem",
            options: {
              "/tmp": {
                fs: "InMemory",
                options: {},
              },
              "/home": {
                fs: "InMemory",
                options: {},
              },
              "/zip": {
                fs: "ZipFS",
                options: {
                  zipData: Buffer.from(data),
                },
              },
              "/sys": {
                fs: "InMemory",
                options: {},
              },
            },
          },
          (e) => (e ? reject(e) : resolve())
        )
      )
  )
  .then(
    () =>
      new Promise((resolve, reject) =>
        recursiveCopy("/zip", "/sys", (e) => (e ? reject(e) : resolve(null)))
      )
  );

fs.readdirSync("/sys").forEach((file) => console.log(file));

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
//@ts-expect-error no types
process.initializeTTYs();
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

fs.readdirSync("/home").forEach((file) => console.log(file));

jvm = await createJVM({
  doppioHomePath: "/sys",
  classpath: ["/home", "/sys/classes"],
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

fs.readdirSync("/home").forEach((file) => console.log(file));
