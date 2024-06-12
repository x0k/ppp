import {
  Actor,
  MessageType,
  WorkerConnection,
  startRemote,
  type Connection,
  type EventMessage,
  type IncomingMessage,
  type OutgoingMessage,
} from "@/lib/actor";
import { createLogger } from "@/lib/logger";
import type { TestRunner, TestRunnerFactory } from "@/lib/testing";

interface Handlers<I, O> {
  [key: string]: any;
  init: (code: string) => Promise<void>;
  run: (data: I) => Promise<O>;
}

type Incoming<I, O> = IncomingMessage<Handlers<I, O>>;

interface WriteEventMessage extends EventMessage<"write", string> {}
interface WritelnEventMessage extends EventMessage<"writeln", string> {}

type TestingActorEvent = WriteEventMessage | WritelnEventMessage;

type Outgoing<I, O> = OutgoingMessage<Handlers<I, O>, string> | TestingActorEvent;

class TestRunnerActor<I, O> extends Actor<Handlers<I, O>, string> {
  private runner: TestRunner<I, O> | null = null;

  constructor(
    connection: Connection<Incoming<I, O>, Outgoing<I, O>>,
    factory: TestRunnerFactory<I, O>
  ) {
    const handlers: Handlers<I, O> = {
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
        return this.runner.run(input);
      },
    };
    super(connection, handlers, String);
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
  return async ({ code, out }) => {
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
    await remote.init(code);
    return {
      async run(input) {
        return remote.run(input);
      },
      [Symbol.dispose]() {
        remote[Symbol.dispose]();
        stopConnection();
        worker.terminate();
      },
    };
  };
}
