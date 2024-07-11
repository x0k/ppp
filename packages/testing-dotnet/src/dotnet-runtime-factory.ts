import type { DotnetCompiler } from "./dotnet-compiler-factory";

export type DotnetRuntime = Omit<DotnetCompiler, "Compile">;

export function makeSimpleExecutionCode(executionCode: string) {
  return `using System.Collections.Generic;
using System.Text.Json;
using System.Diagnostics.CodeAnalysis;

namespace test
{
  public class Program {
    [RequiresUnreferencedCode("Calls System.Text.Json.JsonSerializer.Serialize<TValue>(TValue, JsonSerializerOptions)")]
    public static string Test(string jsonArguments) {
      ${executionCode.split("\n").join("\n      ")}
    }
  }
}
`;
}

export class DotnetRuntimeFactory {
  constructor(protected readonly compiler: DotnetCompiler) {}

  create(code: string, executionCode: string): DotnetCompiler {
    const status = this.compiler.Compile([code, executionCode]);
    if (status !== 0) {
      throw new Error("Compilation failed");
    }
    return this.compiler;
  }
}
