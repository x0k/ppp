import * as BrowserFS from "browserfs";
import * as doppio from "doppiojvm";

const fs = await new Promise((resolve, reject) =>
  BrowserFS.configure(
    {
      fs: "MountableFileSystem",
      options: {
        "/tmp": {
          fs: "InMemory",
          options: {},
        },
        "/home": {
          fs: "LocalStorage",
          options: {},
        },
        "/sys": {
          fs: "XmlHttpRequest",
          options: {
            index: "doppio/listings.json",
          },
        },
      },
    },
    (e) => (e ? reject(e) : resolve(BrowserFS.BFSRequire("fs")))
  )
);

console.log(fs)

const jvm = await new Promise(
  (resolve, reject) =>
    new doppio.VM.JVM(
      {
        doppioHomePath: "/sys",
        classpath: [".", "/sys/classes"],
      },
      (err, jvm) => (err ? reject(err) : resolve(jvm))
    )
);

console.log(jvm)
