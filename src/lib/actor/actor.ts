import type { AnyKey, Brand } from "@/lib/type";
import { err, ok, type Result } from "@/lib/result";
import { neverError } from "@/lib/guards";

import type { Connection } from "./connection";

export type ActorId = Brand<"ActorId">;

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

export type RequestId = Brand<"RequestId">;

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

export enum EventType {
  Error = "error",
  Cancel = "cancel",
}

export interface AbstractEventMessage<T extends EventType>
  extends AbstractMessage<MessageType.Event> {
  event: T;
}

export interface ErrorEventMessage<E>
  extends AbstractEventMessage<EventType.Error> {
  error: E;
}

export interface CancelRequestEventMessage
  extends AbstractEventMessage<EventType.Cancel> {
  id: RequestId;
}

export type Handlers = Record<string, (arg: any) => any>;

type IncomingMessage<H extends Handlers> = {
  [K in keyof H]:
    | RequestMessage<K, Parameters<H[K]>[0]>
    | EventMessage<K, Parameters<H[K]>[0]>;
}[keyof H];

type OutgoingMessage<H extends Handlers, E> =
  | ResponseMessage<Result<ReturnType<H[keyof H]>, E>>
  | ErrorEventMessage<E>;

export interface ActorConfig<H extends Handlers, E> {
  connection: Connection<IncomingMessage<H>, OutgoingMessage<H, E>>;
  handlers: H;
  caseError: (error: any) => E;
}

export class Actor<H extends Handlers, E> {
  constructor(private readonly config: ActorConfig<H, E>) {}

  start() {
    const { connection } = this.config;
    const handleMessage = this.handleMessage.bind(this);
    connection.onMessage(handleMessage);
    return () => {
      connection.onMessage(handleMessage);
    };
  }

  private async handleMessage(data: IncomingMessage<H>) {
    switch (data.type) {
      case MessageType.Request: {
        const { connection } = this.config;
        const result = await this.handleRequest(data);
        connection.send(result);
        return;
      }
      case MessageType.Event: {
        await this.handleEvent(data);
        return;
      }
      default:
        throw neverError(data, "Unknown message type");
    }
  }

  private async handleEvent<K extends keyof H>(
    event: EventMessage<K, Parameters<H[K]>[0]>
  ) {
    try {
      await this.config.handlers[event.event](event.payload);
    } catch (error) {
      this.config.connection.send({
        type: MessageType.Event,
        event: EventType.Error,
        error: this.config.caseError(error),
      });
    }
  }

  private async handleRequest<K extends keyof H>(
    request: RequestMessage<K, Parameters<H[K]>[0]>
  ): Promise<ResponseMessage<Result<ReturnType<H[K]>, E>>> {
    const { handlers, caseError } = this.config;
    try {
      const result = await handlers[request.request](request.payload);
      return {
        type: MessageType.Response,
        id: request.id,
        result: ok(result),
      };
    } catch (error) {
      return {
        type: MessageType.Response,
        id: request.id,
        result: err(caseError(error)),
      };
    }
  }
}
