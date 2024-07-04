import { transpile, ScriptTarget } from "typescript";

export function compileTsModule(code: string) {
  return transpile(code, {
    target: ScriptTarget.ES2022,
    strict: true,
    strictBindCallApply: true,
    strictFunctionTypes: true,
  });
}
