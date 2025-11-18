import type { ReadableStreamOfBytes, Streams, Writer } from "libs/io";
import { makeErrorWriter } from "libs/logger";
import { noop } from "libs/function";

import type { SharedQueue } from "./shared-queue.js";

export function readFromQueue(inputQueue: SharedQueue) {
  const input = new ReadableStream<Uint8Array>({
    pull(controller) {
      const r = inputQueue.blockingRead();
      const bytes = r.next().value.bytes;
      // NOTE: The generator must be exhausted
      r.next();
      controller.enqueue(bytes);
    },
  });
  return input;
}

export function writeToQueue(input: ReadableStreamOfBytes, queue: SharedQueue) {
  const w = new WritableStream<Uint8Array>({
    write(bytes) {
      queue.pushBytes(bytes);
      queue.commit();
    },
  });
  const controller = new AbortController();
  input
    .pipeTo(w, { signal: controller.signal, preventCancel: true })
    .catch(noop);
  return {
    [Symbol.dispose]() {
      controller.abort();
    },
  };
}

export function createStreamsClient(
  inputQueue: SharedQueue,
  writer: Writer
): Streams {
  return {
    in: {
      read() {
        const r = inputQueue.blockingRead();
        const bytes = r.next().value.bytes;
        // NOTE: The generator must be exhausted
        r.next();
        return bytes;
      },
    },
    out: writer,
    err: makeErrorWriter(writer),
  };
}
