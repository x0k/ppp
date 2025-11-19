import type { Logger } from "libs/logger";
import type { Fetcher } from "libs/fetch";

export interface DotnetConfig {
  mainAssemblyName: string;
}

export interface DotnetModule<I, E> {
  getConfig: () => DotnetConfig;
  setModuleImports: (esModuleName: string, imports: I) => void;
  getAssemblyExports: (assemblyName: string) => Promise<E>;
}

export interface DotnetLibsLoader {
  load: (url: string) => Promise<number>;
  getResult: () => Uint8Array;
}

export function createLibsLoader(fetcher: Fetcher): DotnetLibsLoader {
  let bytes = new Uint8Array();
  return {
    load: (url) =>
      fetcher(url)
        .then((r) => r.bytes())
        .then(
          (data) => {
            bytes = data;
            return 0;
          },
          () => 1
        ),
    getResult: () => bytes,
  };
}

export interface CompilerModuleImports {
  logger: Logger;
  loader: DotnetLibsLoader;
}

export interface CompilerModuleExports {
  Compiler: {
    Init: (dllUrls: string[]) => Promise<number>;
    Compile: (code: string[]) => number;
    Run: (typeFullName: string, methodName: string, args: string[]) => number;
    GetResultAsString: () => string | null;
    DisposeAssembly: () => void;
  };
}

export type DotnetCompiler = Omit<CompilerModuleExports["Compiler"], "Init">;

const ES_MODULE_NAME = "main.js";

export class DotnetCompilerFactory {
  constructor(
    protected readonly logger: Logger,
    protected readonly loader: DotnetLibsLoader,
    protected readonly compilerModule: DotnetModule<
      CompilerModuleImports,
      CompilerModuleExports
    >
  ) {}

  async create(dllUrls: string[]): Promise<DotnetCompiler> {
    const { setModuleImports, getAssemblyExports, getConfig } =
      this.compilerModule;
    setModuleImports(ES_MODULE_NAME, {
      logger: this.logger,
      loader: this.loader,
    });
    const config = getConfig();
    const exports = await getAssemblyExports(config.mainAssemblyName);
    const status = await exports.Compiler.Init(dllUrls);
    if (status !== 0) {
      throw new Error("Init failed");
    }
    return exports.Compiler;
  }
}
