import { makeExecutionCode } from "dotnet-runtime";

import type { TestCompilerFactory } from "@/components/editor/model";
import { DotnetTestCompilerFactory } from "@/adapters/runtime/dotnet/test-compiler-factory";

import type { Input, Output } from "../tests-data";

import definitions from "./definitions.cs?raw";
import executionCode from "./execution-code.cs?raw";

export const factory: TestCompilerFactory<Input, Output> = async (ctx, out) => {
  return new DotnetTestCompilerFactory(out).create(ctx, {
    executionCode: makeExecutionCode({
      additionalDefinitions: definitions,
      executionCode: executionCode,
    }),
  });
};
