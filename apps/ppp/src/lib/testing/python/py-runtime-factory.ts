import { loadPyodide } from "pyodide";

import type { Writer } from "@/lib/logger";
import { inContext, type Context } from "@/lib/context";

export const pyRuntimeFactory = (ctx: Context, writer: Writer) =>
  inContext(
    ctx,
    loadPyodide({
      indexURL: import.meta.env.DEV
        ? undefined
        : `${import.meta.env.BASE_URL}/assets/pyodide`,
      stdout: writer.writeln.bind(writer),
    })
  );
