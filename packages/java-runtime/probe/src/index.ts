import * as BrowserFS from "browserfs";

import { createJVM } from "./jvm";

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

console.log(fs);

const jvm = await createJVM({
  doppioHomePath: "/sys",
  classpath: [".", "/sys/classes"],
});

console.log(jvm);
