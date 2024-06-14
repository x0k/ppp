import type { Logger } from "../logger.js";
import { neverError } from "../error.js";
import { isOk } from "../result.js";

import {
  MessageType,
  type Connection,
  type ErrorEventMessage,
  type EventMessage,
  type Handlers,
  type IncomingMessage,
  type OutgoingMessage,
  type RequestId,
} from "./model.js";

interface DeferredPromise<T, E> {
  resolve: (value: T) => void;
  reject: (error: E) => void;
}

export function startRemote<
  H extends Handlers,
  E,
  Event extends EventMessage<string, E>
>(
  log: Logger,
  connection: Connection<OutgoingMessage<H, E> | Event, IncomingMessage<H>>,
  eventHandlers: {
    [K in Event["event"]]: (
      e: Extract<Event, EventMessage<K, any>>["payload"]
    ) => void;
  } & {
    [K in ErrorEventMessage<E>["event"]]: (
      e: ErrorEventMessage<E>["payload"]
    ) => void;
  }
) {
  let lastId = 0;
  const promises = new Map<
    RequestId,
    DeferredPromise<ReturnType<H[keyof H]>, E>
  >();
  const unsubscribe = connection.onMessage((msg) => {
    switch (msg.type) {
      case MessageType.Response: {
        const { id, result } = msg;
        const deferred = promises.get(id);
        if (!deferred) {
          log.error(`Received response for unknown request ${id}`);
          return;
        }
        promises.delete(id);
        if (isOk(result)) {
          deferred.resolve(result.value);
        } else {
          deferred.reject(result.error);
        }
        return;
      }
      case MessageType.Event: {
        // @ts-expect-error ts problem
        const handler = eventHandlers[msg.event];
        if (!handler) {
          log.error(`Received unknown event ${msg.event}`);
          return;
        }
        handler(msg.payload);
        return;
      }
      default:
        throw neverError(msg, "Unknown message type");
    }
  });
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === Symbol.dispose) {
          return unsubscribe;
        }
        const request = prop as keyof H;
        return (arg: Parameters<H[typeof request]>[0]) => {
          const id = lastId++ as RequestId;
          const promise = new Promise<ReturnType<H[typeof request]>>(
            (resolve, reject) => {
              promises.set(id, { resolve, reject });
            }
          );
          connection.send({
            id: id,
            request,
            type: MessageType.Request,
            payload: arg,
          });
          return promise;
        };
      },
    }
  ) as {
    [K in keyof H]: Parameters<H[K]>["length"] extends 0
      ? () => Promise<ReturnType<H[K]>>
      : (arg: Parameters<H[K]>[0]) => Promise<ReturnType<H[K]>>;
  } & Disposable;
}
