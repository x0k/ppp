import type { Connection } from "./model";

export class WorkerConnection<Incoming, Outgoing>
  implements Connection<Incoming, Outgoing>
{
  private handlers = new Set<(message: Incoming) => void>();

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

  send(message: Outgoing) {
    this.worker.postMessage(message);
  }

  onMessage(handler: (message: Incoming) => void) {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }
}
