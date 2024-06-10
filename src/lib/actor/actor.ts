import { err, ok, type Result } from "@/lib/result";
import { neverError } from "@/lib/guards";

import {
  MessageType,
  type Connection,
  type EventMessage,
  type Handlers,
  type IncomingMessage,
  type OutgoingMessage,
  type RequestMessage,
  type ResponseMessage,
} from "./model";

export interface ActorConfig<H extends Handlers, E> {
  connection: Connection<IncomingMessage<H>, OutgoingMessage<H, E>>;
  handlers: H;
  caseError: (error: any) => E;
}

export class Actor<H extends Handlers, E> {
  constructor(protected readonly config: ActorConfig<H, E>) {}

  start() {
    const { connection } = this.config;
    const handleMessage = this.handleMessage.bind(this);
    connection.onMessage(handleMessage);
    return () => {
      connection.onMessage(handleMessage);
    };
  }

  private async handleMessage(msg: IncomingMessage<H>) {
    switch (msg.type) {
      case MessageType.Request: {
        const { connection } = this.config;
        const result = await this.handleRequest(msg);
        connection.send(result);
        return;
      }
      case MessageType.Event: {
        await this.handleEvent(msg);
        return;
      }
      default:
        throw neverError(msg, "Unknown message type");
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
        event: "error",
        payload: this.config.caseError(error),
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
