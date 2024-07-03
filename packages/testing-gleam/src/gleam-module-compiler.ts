import type { Logger } from "libs/logger";
import { compileJsModule } from "testing-javascript";

import {
  initSync,
  write_module,
  initialise_panic_hook,
  compile_package,
  read_compiled_javascript,
  delete_project,
  pop_warning,
} from "../vendor/compiler/gleam_wasm.js";
import stdlib from "../vendor/stdlib/stdlib.js";

export class GleamModuleCompiler {
  protected lastProjectId = 0;

  constructor(
    protected readonly logger: Logger,
    protected readonly precompiledStdlibIndexUrl: string,
    compilerModule: WebAssembly.Module
  ) {
    initSync(compilerModule);
    initialise_panic_hook(false);
    for (const [name, code] of Object.entries(stdlib)) {
      write_module(1, name, code);
    }
  }

  compile(gleamCode: string) {
    const jsCode = this.compileGleamToJavascript(gleamCode);
    return compileJsModule(
      jsCode.replaceAll(
        /from\s+"\.\/(.+)"/g,
        `from "${this.precompiledStdlibIndexUrl}/$1"`
      )
    );
  }

  protected compileGleamToJavascript(gleamCode: string) {
    const projectId = this.lastProjectId++;
    try {
      write_module(projectId, "main", gleamCode);
      // reset_warnings(projectId); // Performed automatically
      compile_package(projectId, "javascript");
      this.printWarnings(projectId);
      const jsCode = read_compiled_javascript(projectId, "main");
      if (jsCode === undefined) {
        throw new Error("Failed to compile Gleam code");
      }
      return jsCode;
    } finally {
      delete_project(projectId);
    }
  }

  protected printWarnings(projectId: number) {
    while (true) {
      const warning = pop_warning(projectId);
      if (warning === undefined) break;
      this.logger.warn(warning);
    }
  }
}
