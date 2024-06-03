import { loadPyodide } from "pyodide";

export const pyRuntimeFactory = () =>
  loadPyodide({
    indexURL: import.meta.env.DEV
      ? undefined
      : `${import.meta.env.BASE_URL}/assets/pyodide`,
  });
