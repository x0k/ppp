import { Actor } from "@/lib/actor";
import {
  MessageType,
  type Connection,
  type EventMessage,
  type IncomingMessage,
  type OutgoingMessage,
} from "@/lib/actor/model";
import type { TestData, TestRunner, TestRunnerFactory } from "@/lib/testing";

interface Handlers<I, O> {
  [key: string]: any;
  init: (code: string) => Promise<void>;
  run: (data: TestData<I, O>) => Promise<O>;
}

export interface WriteEventMessage extends EventMessage<"write", string> {}
export interface WritelnEventMessage extends EventMessage<"writeln", string> {}

type LogEventMessage = WriteEventMessage | WritelnEventMessage;

export class TestRunnerActor<I, O> extends Actor<Handlers<I, O>, string> {
  private runner: TestRunner<I, O> | null = null;

  constructor(
    connection: Connection<
      IncomingMessage<Handlers<I, O>>,
      OutgoingMessage<Handlers<I, O>, string> | LogEventMessage
    >,
    factory: TestRunnerFactory<I, O>
  ) {
    super({
      connection,
      handlers: {
        init: async (code) => {
          this.runner = await factory({
            code,
            out: {
              write(text) {
                connection.send({
                  type: MessageType.Event,
                  event: "write",
                  payload: text,
                });
              },
              writeln(text) {
                connection.send({
                  type: MessageType.Event,
                  event: "writeln",
                  payload: text,
                });
              },
            },
          });
        },
        run: (data) => {
          if (!this.runner) {
            const err = new Error("Test runner not initialized");
            connection.send({
              type: MessageType.Event,
              event: "error",
              payload: err.message,
            });
            throw err;
          }
          return this.runner.run(data.input);
        },
      },
      caseError: String,
    });
  }
}
