export interface Context {
  readonly signal: AbortSignal;
}

export function createContext(): Context {
  return new AbortController();
}

export function withCancel(ctx: Context): [Context, () => void] {
  const ctrl = new AbortController();
  return [
    {
      signal: AbortSignal.any([ctx.signal, ctrl.signal]),
    },
    ctrl.abort.bind(ctrl),
  ];
}

export function withTimeout(ctx: Context, timeoutInMs: number): Context {
  return {
    signal: AbortSignal.any([ctx.signal, AbortSignal.timeout(timeoutInMs)]),
  };
}

export const CANCELED_ERROR = new Error("Context canceled");

export function inContext<T>(ctx: Context, promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (ctx.signal.aborted) {
      reject(CANCELED_ERROR);
      return;
    }
    const cancel = () => {
      reject(CANCELED_ERROR);
    };
    ctx.signal.addEventListener("abort", cancel);
    promise.then(resolve, reject).finally(() => {
      ctx.signal.removeEventListener("abort", cancel);
    });
  });
}
