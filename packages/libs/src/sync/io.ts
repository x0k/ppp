import { noop } from "../function.js";
import type { Streams, ReadableStreamOfBytes, BytesStreamWriter, Writer } from "../io.js";
import { makeErrorWriter } from "../logger.js";

import type { SharedQueue } from "./shared-queue.js";

export enum StreamType {
  Out = 1,
  Err = 2,
}

export const STREAM_TYPES = Object.values(StreamType) as StreamType[];

export function createSharedStreamsClient(
  inputQueue: SharedQueue,
  write: (stream: StreamType, data: Uint8Array) => void
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
    out: {
      write(data) {
        write(StreamType.Out, data);
      },
    },
    err: {
      write(data) {
        write(StreamType.Err, data);
      },
    },
  };
}

export function createSharedStreamsServer(
  inputQueue: SharedQueue,
  input: ReadableStreamOfBytes,
  output: Writer
) {
  const w = new WritableStream<Uint8Array>({
    write(bytes) {
      inputQueue.pushBytes(bytes);
      inputQueue.commit();
    },
  });
  const c = new AbortController();
  input.pipeTo(w, { signal: c.signal }).catch(noop);
  const writers = {
    [StreamType.Out]: output,
    [StreamType.Err]: makeErrorWriter(output),
  } as const;
  return {
    onClientWrite(type: StreamType, data: Uint8Array) {
      writers[type].write(data);
    },
    [Symbol.dispose]() {
      c.abort();
    },
  };
}
