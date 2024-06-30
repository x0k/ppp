import {
  type Inode,
  Directory,
  Fd,
  OpenDirectory,
  wasi as wasiDef,
  File,
} from "@bjorn3/browser_wasi_shim";
import { type Result, err, ok, isErr } from "libs/result";

export function contents(data: Record<string, Inode>): Map<string, Inode> {
  return new Map(Object.entries(data));
}

export function dir(data: Record<string, Inode>): Directory {
  return new Directory(contents(data));
}

export function assertOpenDir(fd: Fd): asserts fd is OpenDirectory {
  if (!(fd instanceof OpenDirectory)) {
    throw new Error("Not an open directory");
  }
}

export function lookup(
  dir: OpenDirectory,
  path: string
): Result<Inode, string> {
  const { ret, inode_obj } = dir.path_lookup(path, 0);
  if (ret !== wasiDef.ERRNO_SUCCESS || !inode_obj) {
    return err(`failed to lookup "${path}", errno: ${ret}`);
  }
  return ok(inode_obj);
}

export function lookupFile(
  dir: OpenDirectory,
  path: string
): Result<File, string> {
  const r = lookup(dir, path);
  if (isErr(r)) {
    return r;
  }
  if (!(r.value instanceof File)) {
    return err(`${path} is not a file`);
  }
  return ok(r.value);
}
