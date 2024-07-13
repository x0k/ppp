// Only type imports are allowed

import type { UniversalFactory } from "testing/actor";

import type { PythonTestWorkerConfig } from "@/adapters/runtime/python/test-worker";

import type { Input, Output } from "../tests-data";

export const factory: UniversalFactory<
  PythonTestWorkerConfig,
  Input,
  Output
> = (ctx, { pythonTestCompilerFactory }) =>
  pythonTestCompilerFactory.create(
    ctx,
    ({ paymentSystem, amount, base }) =>
      `payment("${paymentSystem}", ${base}, ${amount})`
  );
