import type { Brand, AnyKey } from "../type.js";
import type { Result } from "../result.js";
import type { Context } from '../context.js';

export enum MessageType {
  Event = "event",
  Request = "request",
  Response = "response",
}

export interface AbstractMessage<T extends MessageType> {
  type: T;
}

export interface EventMessage<T extends AnyKey, P>
  extends AbstractMessage<MessageType.Event> {
  event: T;
  payload: P;
}

export type RequestId = Brand<"RequestId", number>;

export interface RequestMessage<T extends AnyKey, P>
  extends AbstractMessage<MessageType.Request> {
  id: RequestId;
  request: T;
  payload: P;
}

export interface ResponseMessage<R>
  extends AbstractMessage<MessageType.Response> {
  id: RequestId;
  result: R;
}

export interface Connection<Incoming, Outgoing> {
  onMessage: (ctx: Context, handler: (message: Incoming) => void) => void;
  send: (message: Outgoing) => void;
}

export type Handlers = Record<string, (arg: any) => any>;

export type IncomingMessage<H extends Handlers> = {
  [K in keyof H]:
    | RequestMessage<K, Parameters<H[K]>[0]>
    | EventMessage<K, Parameters<H[K]>[0]>;
}[keyof H];

export interface ErrorEventMessage<E> extends EventMessage<"error", E> {}

export type OutgoingMessage<H extends Handlers, E> =
  | ResponseMessage<Result<ReturnType<H[keyof H]>, E>>
  | ErrorEventMessage<E>;
