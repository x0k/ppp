import * as BrowserFS from "browserfs";
import * as async from "async";

export const path = BrowserFS.BFSRequire("path");
export const fs = BrowserFS.BFSRequire("fs");

function copyFile(srcFile: string, destFile: string, cb: (err?: any) => void) {
  fs.readFile(srcFile, (e: any, data?: Buffer) => {
    if (e) {
      cb(e);
    } else {
      fs.writeFile(destFile, data, cb);
    }
  });
}

export function recursiveCopy(
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

export function ls(path: string) {
  fs.readdirSync(path).forEach((file) => console.log(file));
}
