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
import { compileJsModule } from 'libs/js'

import type { TestRunner, TestRunnerFactory } from "./model.js";
import { ok } from "libs/result";

export interface WorkerInitConfig {
  code: string;
  universalFactoryFunction: string;
}

interface Handlers<I, O> {
  [key: string]: any;
  init(config: WorkerInitConfig): Promise<void>;
  cancel(): void;
  run(data: I): Promise<O>;
}

type Incoming<I, O> = IncomingMessage<Handlers<I, O>>;

interface WriteEventMessage extends EventMessage<"write", Uint8Array> {}

type TestingActorEvent = WriteEventMessage;

type Outgoing<I, O> =
  | OutgoingMessage<Handlers<I, O>, string>
  | TestingActorEvent;

async function evalEntity<T>(functionStr: string) {
  const moduleStr = `export default ${functionStr}`;
  const mod = await compileJsModule<{ default: T }>(moduleStr)
  return mod.default;
}

export type UniversalFactory<I, O, D> = (data: D) => TestRunnerFactory<I, O>;

export type SuperFactory<I, O, D> = (
  universalFactory: UniversalFactory<I, O, D>
) => TestRunnerFactory<I, O>;

class TestRunnerActor<I, O, D> extends Actor<Handlers<I, O>, string> {
  private ctx: Context = createContext();
  private runner: TestRunner<I, O> | null = null;

  constructor(
    connection: Connection<Incoming<I, O>, Outgoing<I, O>>,
    superFactory: SuperFactory<I, O, D>
  ) {
    const handlers: Handlers<I, O> = {
      init: async ({ code, universalFactoryFunction }) => {
        const universalFactory = await evalEntity<UniversalFactory<I, O, D>>(
          universalFactoryFunction
        );
        const factory = superFactory(universalFactory);
        this.runner = await factory(this.ctx, {
          code,
          out: {
            write(buffer) {
              // TODO: synchronously wait for response
              connection.send({
                type: MessageType.Event,
                event: "write",
                payload: buffer,
              });
              return ok(buffer.length);
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

export function startTestRunnerActor<I, O, D>(
  superFactory: SuperFactory<I, O, D>
) {
  const connection = new WorkerConnection<Incoming<I, O>, Outgoing<I, O>>(
    self as unknown as Worker
  );
  const actor = new TestRunnerActor(connection, superFactory);
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

export function makeRemoteTestRunnerFactory<I, O, D>(
  Worker: WorkerConstructor,
  universalFactory: (data: D) => TestRunnerFactory<I, O>
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
        error: (err) => {
          log.error(err);
        },
        write: (text) => {
          out.write(text);
        },
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
      await inContext(
        ctx,
        remote.init({
          code,
          universalFactoryFunction: universalFactory.toString(),
        })
      );
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
