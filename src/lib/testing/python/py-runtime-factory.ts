import { loadPyodide } from "pyodide";

import type { Writer } from '@/lib/logger';

export const pyRuntimeFactory = (writer: Writer) =>
  loadPyodide({
    indexURL: import.meta.env.DEV
      ? undefined
      : `${import.meta.env.BASE_URL}/assets/pyodide`,
    stdout: writer.writeln.bind(writer),
  });
