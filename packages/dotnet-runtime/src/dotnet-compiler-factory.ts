import type { Logger } from "libs/logger";

export interface DotnetConfig {
  mainAssemblyName: string;
}

export interface DotnetModule<I, E> {
  getConfig: () => DotnetConfig;
  setModuleImports: (esModuleName: string, imports: I) => void;
  getAssemblyExports: (assemblyName: string) => Promise<E>;
}

export interface CompilerModuleImports {
  logger: Logger;
}

export interface CompilerModuleExports {
  Compiler: {
    Init: (precompiledLibsIndexUrl: string, libs: string[]) => Promise<number>;
    Compile: (code: string[]) => Promise<number>;
    Run: (typeFullName: string, methodName: string, args: string[]) => Promise<number>;
    GetResultAsString: () => string | null;
    DisposeAssembly: () => void;
  };
}

export type DotnetCompiler = Omit<CompilerModuleExports["Compiler"], "Init">;

const ES_MODULE_NAME = "main.js";

export class DotnetCompilerFactory {
  constructor(
    protected readonly logger: Logger,
    protected readonly compilerModule: DotnetModule<
      CompilerModuleImports,
      CompilerModuleExports
    >
  ) {}

  async create(
    precompiledLibsIndexUrl: string,
    libs: string[]
  ): Promise<DotnetCompiler> {
    const { setModuleImports, getAssemblyExports, getConfig } =
      this.compilerModule;
    setModuleImports(ES_MODULE_NAME, {
      logger: this.logger,
    });
    const config = getConfig();
    const exports = await getAssemblyExports(config.mainAssemblyName);
    const status = await exports.Compiler.Init(precompiledLibsIndexUrl, libs);
    if (status !== 0) {
      throw new Error("Init failed");
    }
    return exports.Compiler;
  }
}
