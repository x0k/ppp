import {
  createContext,
  inContext,
  withCancel,
  type Context,
} from "libs/context";
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
import { compileJsModule } from "libs/js";
import type { File } from "compiler";
import type { Writer } from "libs/io";
import { ok } from "libs/result";

import type { TestProgram, TestCompiler } from "./testing.js";

export interface InitConfig {
  universalFactoryFunction: string;
}

interface Handlers<I, O> {
  [key: string]: any;
  init(config: InitConfig): Promise<void>;
  compile(files: File[]): Promise<void>;
  test(data: I): Promise<O>;
  cancel(): void;
  dispose(): void;
}

type Incoming<I, O> = IncomingMessage<Handlers<I, O>>;

interface WriteEventMessage extends EventMessage<"write", Uint8Array> {}

type TestingActorEvent = WriteEventMessage;

type Outgoing<I, O> =
  | OutgoingMessage<Handlers<I, O>, string>
  | TestingActorEvent;

async function evalEntity<T>(functionStr: string) {
  const moduleStr = `export default ${functionStr}`;
  const mod = await compileJsModule<{ default: T }>(moduleStr);
  return mod.default;
}

export type UniversalFactory<D, I, O> = (
  ctx: Context,
  data: D
) => Promise<TestCompiler<I, O>>;

export type TestCompilerFactory<D, I, O> = (
  ctx: Context,
  out: Writer,
  universalFactory: UniversalFactory<D, I, O>
) => Promise<TestCompiler<I, O>>;

class TestCompilerActor<D, I, O> extends Actor<Handlers<I, O>, string> {
  private ctxWithCancel = withCancel(createContext());
  private testCompiler: TestCompiler<I, O> | null = null;
  private testProgram: TestProgram<I, O> | null = null;

  constructor(
    connection: Connection<Incoming<I, O>, Outgoing<I, O>>,
    superFactory: TestCompilerFactory<D, I, O>
  ) {
    const cancel = () => {
      this.ctxWithCancel[1]();
      this.ctxWithCancel = withCancel(createContext())
    }
    const handlers: Handlers<I, O> = {
      init: async ({ universalFactoryFunction }) => {
        const universalFactory = await evalEntity<UniversalFactory<D, I, O>>(
          universalFactoryFunction
        );
        const out: Writer = {
          write(buffer) {
            // TODO: synchronously wait for response
            connection.send({
              type: MessageType.Event,
              event: "write",
              payload: buffer,
            });
            return ok(buffer.length);
          },
        };
        try {
          this.testCompiler = await superFactory(
            this.ctxWithCancel[0],
            out,
            universalFactory
          );
        } finally {
          cancel()
        }
      },
      compile: async (files) => {
        if (this.testCompiler === null) {
          throw new Error("Test runner not initialized");
        }
        try {
          this.testProgram = await this.testCompiler.compile(
            this.ctxWithCancel[0],
            files
          );
        } finally {
          cancel()
        }
      },
      test: (input) => {
        if (!this.testProgram) {
          const err = new Error("Test runner not initialized");
          connection.send({
            type: MessageType.Event,
            event: "error",
            payload: err.message,
          });
          throw err;
        }
        try {
          return this.testProgram.run(this.ctxWithCancel[0], input);
        } finally {
          cancel()
        }
      },
      cancel,
      dispose: () => {
        if (this.testProgram !== null) {
          this.testProgram[Symbol.dispose]();
        }
        if (this.testCompiler !== null) {
          this.testCompiler[Symbol.dispose]();
        }
      },
    };
    super(connection, handlers, stringifyError);
  }
}

export function startTestCompilerActor<D, I = unknown, O = unknown>(
  ctx: Context,
  superFactory: TestCompilerFactory<D, I, O>
) {
  const connection = new WorkerConnection<Incoming<I, O>, Outgoing<I, O>>(
    self as unknown as Worker
  );
  connection.start(ctx);
  const actor = new TestCompilerActor(connection, superFactory);
  actor.start(ctx);
}

interface WorkerConstructor {
  new (): Worker;
}

export function makeRemoteTestCompilerFactory<D, I, O>(
  Worker: WorkerConstructor,
  universalFactory: UniversalFactory<D, I, O>
) {
  return async (ctx: Context, out: Writer): Promise<TestCompiler<I, O>> => {
    const worker = new Worker();
    const connection = new WorkerConnection<Outgoing<I, O>, Incoming<I, O>>(
      worker
    );
    connection.start(ctx);
    const log = createLogger(out);
    const remote = startRemote<Handlers<I, O>, string, TestingActorEvent>(
      ctx,
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
    const cancelRemote = () => {
      remote.cancel();
    };
    ctx.signal.addEventListener("abort", cancelRemote);
    try {
      await inContext(
        ctx,
        remote.init({
          universalFactoryFunction: universalFactory.toString(),
        })
      );
    } catch (err) {
      worker.terminate();
      throw err;
    } finally {
      ctx.signal.removeEventListener("abort", cancelRemote);
    }
    return {
      async compile(ctx, files) {
        ctx.signal.addEventListener("abort", cancelRemote);
        try {
          await inContext(ctx, remote.compile(files));
          return {
            async run(ctx, input) {
              ctx.signal.addEventListener("abort", cancelRemote);
              try {
                return await inContext(ctx, remote.test(input));
              } finally {
                ctx.signal.removeEventListener("abort", cancelRemote);
              }
            },
            [Symbol.dispose]() {
              void remote.dispose();
            },
          };
        } finally {
          ctx.signal.removeEventListener("abort", cancelRemote);
        }
      },
      [Symbol.dispose]: worker.terminate.bind(worker),
    };
  };
}
