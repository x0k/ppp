export interface Context {
  signal: AbortSignal;
  canceled: boolean;
  cancel(): void;
  onCancel(cb: () => void): Disposable;
}

export function createContext(timeoutInMs = 0): Context {
  const ctrl = new AbortController();
  if (timeoutInMs > 0) {
    setTimeout(() => ctrl.abort(), timeoutInMs);
  }
  return {
    get canceled() {
      return ctrl.signal.aborted;
    },
    get signal() {
      return ctrl.signal;
    },
    onCancel(cb) {
      ctrl.signal.addEventListener("abort", cb);
      return {
       [Symbol.dispose]: () => ctrl.signal.removeEventListener("abort", cb)
      }
    },
    cancel() {
      ctrl.abort();
    },
  };
}

export function withCancel(ctx: Context): Context {
  if (ctx.canceled) {
    return ctx;
  }
  const leaf = createContext();
  const cancel = () => {
    ctx.signal.removeEventListener("abort", cancel);
    leaf.cancel();
  };
  ctx.signal.addEventListener("abort", cancel);
  return {
    ...leaf,
    cancel,
  };
}

export function withTimeout(ctx: Context, timeoutInMs: number): Context {
  if (ctx.canceled) {
    return ctx;
  }
  const leaf = createContext();
  const cancel = () => {
    ctx.signal.removeEventListener("abort", cancel);
    leaf.cancel();
  };
  ctx.signal.addEventListener("abort", cancel);
  setTimeout(cancel, timeoutInMs);
  return {
    ...leaf,
    cancel,
  };
}

export const CANCELED_ERROR = new Error("Context canceled");

export function inContext<T>(ctx: Context, promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (ctx.canceled) {
      reject(CANCELED_ERROR);
      return;
    }
    const disposable = ctx.onCancel(() => {
      reject(CANCELED_ERROR);
    });
    promise.then(resolve, reject).finally(disposable[Symbol.dispose]);
  });
}
