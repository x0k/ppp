import type { Streams, Writer } from "../io.js";

import type { SharedQueue } from "./shared-queue.js";

export type NotificationType = "i-want-to-read" | "i-wrote-something";

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

enum StreamType {
  Out = 1,
  Err = 2,
}

const EMPTY_ARRAY = new Uint8Array();

export function createSharedStreamsClient(
  queue: SharedQueue,
  notify: (type: NotificationType) => void
): Streams {
  return {
    in: {
      read() {
        while (true) {
          notify("i-want-to-read");
          const r = queue.blockingRead();
          const bytes = r.next().value.bytes;
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
    // NOTE: We can read something (i.e. amount of written bytes) from the server
    // but the user may not have `SharedArrayBuffer`, so don't block on writes
    out: {
      write(data) {
        queue.pushUint(StreamType.Out);
        queue.pushBytes(data);
        queue.commit();
        notify("i-wrote-something");
      },
    },
    err: {
      write(data) {
        queue.pushUint(StreamType.Err);
        queue.pushBytes(data);
        queue.commit();
        notify("i-wrote-something");
      },
    },
  };
}

export function createSharedStreamsServer(
  queue: SharedQueue,
  streams: Streams
) {
  const writers: Record<StreamType, Writer> = {
    [StreamType.Out]: streams.out,
    [StreamType.Err]: streams.err,
  };
  return {
    read() {
      const g = queue.read();
      for (const item of g) {
        const type = item.uint as StreamType;
        writers[type].write(g.next().value.bytes);
      }
    },
    write() {
      queue.pushBytes(streams.in.read());
      queue.commit();
    },
  };
}
