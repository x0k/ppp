import { transpile, ScriptTarget } from "typescript";

import { compileJsModule } from "testing-javascript";

export function compileTsModule<M>(code: string) {
  return compileJsModule<M>(
    transpile(code, {
      target: ScriptTarget.ES2022,
      strict: true,
      strictBindCallApply: true,
      strictFunctionTypes: true,
    })
  );
}
