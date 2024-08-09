import { makeRemoteTestCompilerFactory } from "testing/actor";

import Worker from "@/adapters/runtime/java/test-worker?worker";

// Only type imports are allowed

import type { TestCompilerFactory } from "testing";

import type { JavaTestWorkerConfig } from "@/adapters/runtime/java/test-worker";

import type { Input, Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

export const factory: TestCompilerFactory<Input, Output> =
  makeRemoteTestCompilerFactory(
    Worker,
    (ctx, { javaTestCompilerFactory, util }: JavaTestWorkerConfig) => {
      const JAVA_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
        paypal: "PAY_PAL",
        webmoney: "WEB_MONEY",
        "cat-bank": "CAT_BANK",
      };
      return javaTestCompilerFactory.create(ctx, {
        classDefinitions: `static native String getSystemType();
  static native int getBase();
  static native int getAmount();
  static native void saveResult(int result);`,
        mainMethodBody: `saveResult(Payment.execute(
      SystemType.valueOf(getSystemType()),
      getBase(),
      getAmount()
    ));`,
        nativesFactory: (input, save) => ({
          // @ts-expect-error TODO: import thread type
          "getSystemType()Ljava/lang/String;": (t) =>
            util.initString(
              t.getBsCl(),
              JAVA_PAYMENT_SYSTEM_TYPES[input.paymentSystem]
            ),
          "getBase()I": () => input.base,
          "getAmount()I": () => input.amount,
          "saveResult(I)V": (_: unknown, result: number) => save(result),
        }),
      });
    }
  );
