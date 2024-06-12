export interface Context {
  signal: AbortSignal;
  canceled: boolean;
  cancel(): void;
  onCancel(cb: () => void): () => void;
}

export function createContext(): Context {
  const ctrl = new AbortController();
  return {
    get canceled() {
      return ctrl.signal.aborted;
    },
    get signal() {
      return ctrl.signal;
    },
    onCancel(cb) {
      ctrl.signal.addEventListener("abort", cb);
      return () => ctrl.signal.removeEventListener("abort", cb);
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

export const CANCELED_ERROR = new Error("Context canceled");

export function inContext<T>(ctx: Context, promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (ctx.canceled) {
      reject(CANCELED_ERROR);
      return;
    }
    const dispose = ctx.onCancel(() => {
      reject(CANCELED_ERROR);
    });
    promise.then(resolve, reject).finally(dispose);
  });
}
