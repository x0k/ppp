import type { Streams, Writer } from "../io.js";

import type { SharedQueue } from "./shared-queue.js";

export const EOF_SEQUENCE = new Uint8Array([0xff, 0xfe, 0xfd]);

function isArraysEqual<T>(arr1: ArrayLike<T>, arr2: ArrayLike<T>) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

export enum StreamType {
  Out = 1,
  Err = 2,
}

const EMPTY_ARRAY = new Uint8Array();

export function createSharedStreamsClient(
  inputQueue: SharedQueue,
  readRequest: () => void,
  write: (stream: StreamType, data: Uint8Array) => void
): Streams {
  return {
    in: {
      read() {
        while (true) {
          readRequest();
          const r = inputQueue.blockingRead();
          const bytes = r.next().value.bytes;
          // NOTE: The generator must be exhausted
          r.next()
          if (bytes.length === 0) {
            continue;
          }
          if (isArraysEqual(bytes, EOF_SEQUENCE)) {
            return EMPTY_ARRAY;
          }
          return bytes;
        }
      },
    },
    out: {
      write(data) {
        write(StreamType.Out, data)
      },
    },
    err: {
      write(data) {
        write(StreamType.Err, data)
      },
    },
  };
}

export function createSharedStreamsServer(
  inputQueue: SharedQueue,
  streams: Streams
) {
  const writers: Record<StreamType, Writer> = {
    [StreamType.Out]: streams.out,
    [StreamType.Err]: streams.err,
  };
  return {
    onClientWrite(type: StreamType, data: Uint8Array) {
      writers[type].write(data);
    },
    write() {
      inputQueue.pushBytes(streams.in.read());
      inputQueue.commit();
    },
  };
}
