import { neverError } from './guards';

export enum MessageType {
  Request = "request",
}

export interface AbstractMessage<T extends MessageType> {
  type: T;
}

export interface RequestMessage<T>
  extends AbstractMessage<MessageType.Request> {
  id: number;
  payload: T;
}

export type Message<T> = RequestMessage<T>;

export interface HandlerCall<H extends string, I> {
  handler: H;
  args: I;
}

export type HandlerCalls<H extends Record<string, (...args: any[]) => any>> = {
  [K in keyof H & string]: HandlerCall<K, Parameters<H[K]>>;
}[keyof H & string];

export function defineServer<H extends Record<string, (...args: any[]) => any>>(
  handlers: H
) {
  function handleMessage({ data }: MessageEvent<Message<HandlerCalls<H>>>) {
    switch (data.type) {
      case MessageType.Request:
        return
      default:
        throw neverError(data.type, `Unknown message type`);
    }
  }
}
