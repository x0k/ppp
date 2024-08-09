import BrowserFS from "browserfs";
import type { FSModule } from "browserfs/dist/node/core/FS";

export { FSModule };

const path = BrowserFS.BFSRequire("path");
const fs = BrowserFS.BFSRequire("fs");
const { Buffer } = BrowserFS.BFSRequire("buffer");

function copyFile(srcFile: string, destFile: string) {
  fs.writeFileSync(destFile, fs.readFileSync(srcFile));
}

function recursiveCopy(srcFolder: string, destFolder: string) {
  function processDir(srcFolder: string, destFolder: string) {
    try {
      fs.mkdirSync(destFolder);
    } catch (err) {
      // Ignore EEXIST.
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code !== "EEXIST"
      ) {
        throw err;
      }
    }
    for (let item of fs.readdirSync(srcFolder)) {
      const srcItem = path.resolve(srcFolder, item),
        destItem = path.resolve(destFolder, item),
        stat = fs.statSync(srcItem);
      if (stat.isDirectory()) {
        processDir(srcItem, destItem);
      } else {
        copyFile(srcItem, destItem);
      }
    }
  }
  processDir(srcFolder, destFolder);
}

export async function initFs(libZipData: ArrayBuffer): Promise<FSModule> {
  await new Promise<void>((resolve, reject) =>
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
              zipData: Buffer.from(libZipData),
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
  );
  recursiveCopy("/zip", "/sys");
  return fs;
}
