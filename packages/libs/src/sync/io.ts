import type { Streams, Writer } from "../io.js";

import type { SharedQueue } from "./shared-queue.js";

export enum StreamType {
  Out = 1,
  Err = 2,
}

export function createSharedStreamsClient(
  inputQueue: SharedQueue,
  beforeRead: () => void,
  write: (stream: StreamType, data: Uint8Array) => void
): Streams {
  return {
    in: {
      read() {
        beforeRead()
        const r = inputQueue.blockingRead();
        const bytes = r.next().value.bytes;
        // NOTE: The generator must be exhausted
        r.next();
        return bytes;
      },
      onData() {
        throw new Error("Not implemented");
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
    write(size: number) {
      const bytes = streams.in.read()
      inputQueue.pushBytes(bytes.subarray(bytes.length - size));
      inputQueue.commit();
    },
  };
}
