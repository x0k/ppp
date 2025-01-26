export interface Context {
  readonly signal: AbortSignal;
  onCancel(action: () => void): Disposable;
}

function noop() {}

function createContextFromSignal(signal: AbortSignal): Context {
  return {
    signal,
    onCancel(action) {
      if (signal.aborted) {
        action();
        return { [Symbol.dispose]: noop };
      }
      signal.addEventListener("abort", action);
      return {
        [Symbol.dispose]() {
          signal.removeEventListener("abort", action);
        },
      };
    },
  };
}

export function createContext(): Context {
  const ctrl = new AbortController();
  return createContextFromSignal(ctrl.signal);
}

export function withCancel(ctx: Context): [Context, () => void] {
  const ctrl = new AbortController();
  const signal = AbortSignal.any([ctx.signal, ctrl.signal]);
  return [createContextFromSignal(signal), ctrl.abort.bind(ctrl)];
}

export function withTimeout(ctx: Context, timeoutInMs: number): Context {
  const signal = AbortSignal.any([
    ctx.signal,
    AbortSignal.timeout(timeoutInMs),
  ]);
  return createContextFromSignal(signal);
}

export class CanceledError extends Error {
  constructor() {
    super('Context is canceled')
  }
}

export function inContext<T>(ctx: Context, promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (ctx.signal.aborted) {
      reject(new CanceledError());
      return;
    }
    const cancel = () => {
      reject(new CanceledError());
    };
    ctx.signal.addEventListener("abort", cancel);
    promise.then(resolve, reject).finally(() => {
      ctx.signal.removeEventListener("abort", cancel);
    });
  });
}

export function createRecoverableContext(
  contextFactory: () => [Context, () => void],
): [Context, () => void, Disposable] {
  const ctxWithCancel = contextFactory()
  const recoverable: [Context, () => void, Disposable] = [
    ctxWithCancel[0],
    ctxWithCancel[1],
    ctxWithCancel[0].onCancel(function handleCancel() {
      recoverable[2][Symbol.dispose]()
      const [ctx, cancel] = contextFactory()
      recoverable[0] = ctx
      recoverable[1] = cancel
      recoverable[2] = ctx.onCancel(handleCancel)
    })
  ]
  return recoverable
}

