<script lang="ts">
  import type { editor } from "monaco-editor";
  import { WebPHP } from "@php-wasm/web";
  import { runTestCase, type TestCase, type TestData } from "@/example/test";

  let { php, model }: { php: WebPHP; model: editor.IModel } = $props();

  enum CaseStatus {
    Idle = "idle",
    Running = "running",
    Success = "success",
    Error = "error",
  }

  abstract class PHPTestCase<I, O> implements TestCase<I, O> {
    constructor(
      protected readonly php: WebPHP,
      protected readonly code: string
    ) {}

    protected abstract transformCode(input: I): string;
    protected abstract transformResult(result: string): O;

    async run(input: I): Promise<O> {
      const code = this.transformCode(input);
      const result = await this.php.run({ code });
      if (result.errors) {
        throw new Error(result.errors);
      }
      return this.transformResult(result.text);
    }
  }

  enum PaymentSystemType {
    PayPal = "paypal",
    WebMoney = "webmoney",
    CatBank = "cat-bank",
  }

  interface FirstTestCaseInput {
    paymentSystem: PaymentSystemType;
    amount: number;
  }

  const PHP_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
    [PaymentSystemType.PayPal]: "PaymentSystemType::PAYPAL",
    [PaymentSystemType.WebMoney]: "PaymentSystemType::WEBMONEY",
    [PaymentSystemType.CatBank]: "PaymentSystemType::CAT_BANK",
  };

  class FirstTestCase extends PHPTestCase<FirstTestCaseInput, number> {
    protected transformCode({
      paymentSystem,
      amount,
    }: FirstTestCaseInput): string {
      return `${this.code}\necho case1(${PHP_PAYMENT_SYSTEM_TYPES[paymentSystem]}, ${amount});`;
    }
    protected transformResult(result: string): number {
      const r = parseInt(result, 10);
      if (isNaN(r)) {
        throw new Error(`Invalid result type: ${result}, expected number`);
      }
      return r;
    }
  }

  const cases = $state([
    {
      id: "1",
      name: "Case 1",
      status: CaseStatus.Idle,
      testCase: (code: string) => new FirstTestCase(php, code),
      testData: [
        {
          input: { paymentSystem: PaymentSystemType.PayPal, amount: 1 },
          output: 2,
        },
        {
          input: { paymentSystem: PaymentSystemType.WebMoney, amount: 1 },
          output: 3,
        },
        {
          input: { paymentSystem: PaymentSystemType.CatBank, amount: 2 },
          output: 4,
        },
      ] satisfies TestData<FirstTestCaseInput, number>[],
    },
    {
      id: "2",
      name: "Case 2",
      status: CaseStatus.Idle,
      testCase: (code: string) => new FirstTestCase(php, code),
      testData: [] satisfies TestData<FirstTestCaseInput, number>[],
    },
  ]);
</script>

<button class="btn btn-sm btn-primary"> Run All </button>
{#each cases as testCase (testCase.id)}
  <button
    class="btn btn-sm btn-secondary"
    class:btn-success={testCase.status === CaseStatus.Success}
    class:btn-error={testCase.status === CaseStatus.Error}
    onclick={async () => {
      if (testCase.status === CaseStatus.Running) {
        return;
      }
      testCase.status = CaseStatus.Running;
      const t = testCase.testCase(model.getValue());
      try {
        await runTestCase(t, testCase.testData);
        testCase.status = CaseStatus.Success;
      } catch (e) {
        console.error(e);
        testCase.status = CaseStatus.Error;
      }
    }}
  >
    {testCase.name}
    {#if testCase.status === CaseStatus.Running}
      <span class="loading loading-spinner"></span>
    {/if}
  </button>
{/each}
