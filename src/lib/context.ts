export interface Context {
  signal: AbortSignal;
  canceled: boolean;
  cancel(): void;
  onCancel(cb: () => void): () => void;
}

export function root(): Context {
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
  const leaf = root();
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
