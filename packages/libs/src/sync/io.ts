import type { ReadableStreamOfBytes } from "libs/io";

import type { SharedQueue } from "./shared-queue.js";

export function readFromQueue(
  inputQueue: SharedQueue,
) {
  const input = new ReadableStream<Uint8Array>({
    pull(controller) {
      const r = inputQueue.blockingRead()
      const bytes = r.next().value.bytes;
      // NOTE: The generator must be exhausted
      r.next()
      controller.enqueue(bytes)
    },
  })
  return input
}

export function writeToQueue(input: ReadableStreamOfBytes, queue: SharedQueue) {
  const w = new WritableStream<Uint8Array>({
    write(bytes) {
      queue.pushBytes(bytes);
      queue.commit();
    },
  });
  const controller = new AbortController();
  input.pipeTo(w);
  return {
    [Symbol.dispose]() {
      controller.abort();
    },
  };
}
