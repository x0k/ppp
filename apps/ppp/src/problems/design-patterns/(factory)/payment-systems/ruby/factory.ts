import { makeRemoteTestCompilerFactory } from "libs/testing/actor";

import Worker from "@/adapters/runtime/ruby/test-worker?worker";

// Only type imports are allowed

import type { TestCompilerFactory } from "libs/testing";

import type { RubyTestWorkerConfig } from "@/adapters/runtime/ruby/test-worker";

import type { Input, Output } from "../tests-data";

export const factory: TestCompilerFactory<Input, Output> =
  makeRemoteTestCompilerFactory(
    Worker,
    (ctx, { rubyTestCompilerFactory }: RubyTestWorkerConfig) =>
      rubyTestCompilerFactory.create(
        ctx,
        ({ paymentSystem, base, amount }) =>
          `payment("${paymentSystem}", ${base}, ${amount})`
      )
  );
