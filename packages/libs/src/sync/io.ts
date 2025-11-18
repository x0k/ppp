import type { Streams, ReadableStreamOfBytes, Writer } from "../io.js";
import { makeErrorWriter } from "../logger.js";

import type { SharedQueue } from "./shared-queue.js";

export function createSharedStreamsClient(
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

export function pipeToQueue(input: ReadableStreamOfBytes, queue: SharedQueue) {
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
