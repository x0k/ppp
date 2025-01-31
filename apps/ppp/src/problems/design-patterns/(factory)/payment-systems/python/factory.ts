import { makeRemoteTestCompilerFactory } from "libs/testing/actor";

import Worker from "@/adapters/runtime/python/test-worker?worker";

// Only type imports are allowed

import type { TestCompilerFactory } from "libs/testing";

import type { PythonTestWorkerConfig } from "@/adapters/runtime/python/test-worker";

import type { Input, Output } from "../tests-data";

export const factory: TestCompilerFactory<Input, Output> =
  makeRemoteTestCompilerFactory(
    Worker,
    (ctx, { pythonTestCompilerFactory }: PythonTestWorkerConfig) =>
      pythonTestCompilerFactory.create(
        ctx,
        ({ paymentSystem, amount, base }) =>
          `payment("${paymentSystem}", ${base}, ${amount})`
      )
  );
