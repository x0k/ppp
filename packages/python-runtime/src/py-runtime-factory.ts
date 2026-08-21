import { loadPyodide, type PyodideInterface } from "pyodide";

import { inContext, type Context } from "libs/context";
import type { Streams } from "libs/io";

export const pyRuntimeFactory = async (
  ctx: Context,
  streams: Streams,
  indexUrl: string,
): Promise<PyodideInterface> => {
  // pyodide loads pyodide.asm.wasm/mjs, python_stdlib.zip and
  // pyodide-lock.json relative to indexURL, which must point at a served
  // copy of the pyodide distribution (see the app's static-copy config).
  const pyodide = await inContext(
    ctx,
    loadPyodide({
      indexURL: indexUrl,
    }),
  );
  pyodide.setStdin({
    stdin: streams.in.read.bind(streams.in),
    isatty: true,
    autoEOF: false,
  });
  pyodide.setStdout({
    write(data) {
      streams.out.write(data);
      return data.length;
    },
  });
  pyodide.setStderr({
    write(data) {
      streams.err.write(data);
      return data.length;
    },
  });
  return pyodide;
};
