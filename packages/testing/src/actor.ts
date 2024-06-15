import { createContext, inContext, type Context } from "libs/context";
import { createLogger } from "libs/logger";
import {
  Actor,
  MessageType,
  WorkerConnection,
  startRemote,
  type Connection,
  type EventMessage,
  type IncomingMessage,
  type OutgoingMessage,
} from "libs/actor";
import { stringifyError } from "libs/error";

import type { TestRunner, TestRunnerFactory } from "./model.js";

interface Handlers<I, O> {
  [key: string]: any;
  init(code: string): Promise<void>;
  cancel(): void;
  run(data: I): Promise<O>;
}

type Incoming<I, O> = IncomingMessage<Handlers<I, O>>;

interface WriteEventMessage extends EventMessage<"write", string> {}
interface WritelnEventMessage extends EventMessage<"writeln", string> {}

type TestingActorEvent = WriteEventMessage | WritelnEventMessage;

type Outgoing<I, O> =
  | OutgoingMessage<Handlers<I, O>, string>
  | TestingActorEvent;

class TestRunnerActor<I, O> extends Actor<Handlers<I, O>, string> {
  private ctx: Context = createContext();
  private runner: TestRunner<I, O> | null = null;

  constructor(
    connection: Connection<Incoming<I, O>, Outgoing<I, O>>,
    factory: TestRunnerFactory<I, O>
  ) {
    const handlers: Handlers<I, O> = {
      init: async (code) => {
        this.runner = await factory(this.ctx, {
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
      cancel: () => {
        this.ctx.cancel();
        this.ctx = createContext();
      },
      run: (input) => {
        if (!this.runner) {
          const err = new Error("Test runner not initialized");
          connection.send({
            type: MessageType.Event,
            event: "error",
            payload: err.message,
          });
          throw err;
        }
        return this.runner.run(this.ctx, input);
      },
    };
    super(connection, handlers, stringifyError);
  }
}

export function startTestRunnerActor<I, O>(factory: TestRunnerFactory<I, O>) {
  const connection = new WorkerConnection<Incoming<I, O>, Outgoing<I, O>>(
    self as unknown as Worker
  );
  const actor = new TestRunnerActor(connection, factory);
  const stopConnection = connection.start();
  const stopActor = actor.start();
  return () => {
    stopActor();
    stopConnection();
  };
}

interface WorkerConstructor {
  new (): Worker;
}

export function makeRemoteTestRunnerFactory<I, O>(
  Worker: WorkerConstructor
): TestRunnerFactory<I, O> {
  return async (ctx, { code, out }) => {
    const worker = new Worker();
    const connection = new WorkerConnection<Outgoing<I, O>, Incoming<I, O>>(
      worker
    );
    const stopConnection = connection.start();
    const log = createLogger(out);
    const remote = startRemote<Handlers<I, O>, string, TestingActorEvent>(
      log,
      connection,
      {
        error: (err) => log.error(err),
        write: (text) => out.write(text),
        writeln: (text) => out.writeln(text),
      }
    );
    const dispose = () => {
      remote[Symbol.dispose]();
      stopConnection();
      worker.terminate();
    };
    const clear = ctx.onCancel(() => {
      remote.cancel();
    });
    try {
      await inContext(ctx, remote.init(code));
    } catch (err) {
      dispose();
      throw err;
    } finally {
      clear();
    }
    return {
      async run(ctx, input) {
        const clear = ctx.onCancel(() => {
          remote.cancel();
        });
        try {
          return inContext(ctx, remote.run(input));
        } finally {
          clear();
        }
      },
      [Symbol.dispose]: dispose,
    };
  };
}
