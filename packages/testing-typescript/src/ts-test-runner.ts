import { transpile, ScriptTarget } from "typescript";

import { JsTestRunner } from "testing-javascript";

export abstract class TsTestRunner<M, I, O> extends JsTestRunner<M, I, O> {
  protected override transformCode(code: string) {
    return super.transformCode(
      transpile(code, {
        target: ScriptTarget.ES2022,
        strict: true,
        strictBindCallApply: true,
        strictFunctionTypes: true,
      })
    );
  }
}
