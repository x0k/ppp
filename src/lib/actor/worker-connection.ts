import type { Connection } from "./connection";

export class WorkerConnection<I, O> implements Connection<I, O> {
  private handlers = new Set<(message: I) => void>();

  constructor(private readonly worker: Worker) {}

  start() {
    const onMsg = (e: MessageEvent) => {
      for (const handler of this.handlers) {
        handler(e.data);
      }
    };
    this.worker.addEventListener("message", onMsg);
    return () => {
      this.worker.removeEventListener("message", onMsg);
    };
  }

  send(message: O) {
    this.worker.postMessage(message);
  }

  onMessage(handler: (message: I) => void) {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }
}
