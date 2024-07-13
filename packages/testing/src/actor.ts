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
import { compileJsModule } from "libs/js";
import type { File } from "libs/compiler";
import type { Writer } from "libs/io";
import { ok } from 'libs/result';

import type { TestProgram, TestProgramCompiler } from "./model.js";

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

export type UniversalFactory<D, I, O> = (ctx: Context, data: D) => Promise<TestProgramCompiler<I, O>>;

export type TestCompilerFactory<D, I, O> = (
  ctx: Context,
  out: Writer,
  universalFactory: UniversalFactory<D, I, O>
) => Promise<TestProgramCompiler<I, O>>;

class TestCompilerActor<D, I, O> extends Actor<Handlers<I, O>, string> {
  private ctx: Context = createContext();
  private testProgramCompiler: TestProgramCompiler<I, O> | null = null;
  private testProgram: TestProgram<I, O> | null = null;

  constructor(
    connection: Connection<Incoming<I, O>, Outgoing<I, O>>,
    superFactory: TestCompilerFactory<D, I, O>
  ) {
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
        }
        this.testProgramCompiler = await superFactory(this.ctx, out, universalFactory);
      },
      compile: async (files) => {
        if (this.testProgramCompiler === null) {
          throw new Error("Test runner not initialized");
        }
        this.testProgram = await this.testProgramCompiler.compile(this.ctx, files);
      },
      cancel: () => {
        this.ctx.cancel();
        this.ctx = createContext();
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
        return this.testProgram.run(this.ctx, input);
      },
      dispose: () => {
        if (!this.testProgram) {
          return
        }
        this.testProgram[Symbol.dispose]()
      },
    };
    super(connection, handlers, stringifyError);
  }
}

export function startTestCompilerActor<D, I = unknown, O = unknown>(
  superFactory: TestCompilerFactory<D, I, O>
) {
  const connection = new WorkerConnection<Incoming<I, O>, Outgoing<I, O>>(
    self as unknown as Worker
  );
  const actor = new TestCompilerActor(connection, superFactory);
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

export async function makeRemoteTestCompilerFactory<D, I, O>(
  ctx: Context,
  Worker: WorkerConstructor,
  universalFactory: (data: D) => TestProgramCompiler<I, O>,
  out: Writer
): Promise<TestProgramCompiler<I, O>> {
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
  using _ = ctx.onCancel(() => {
    remote.cancel();
  });
  try {
    await inContext(
      ctx,
      remote.init({
        universalFactoryFunction: universalFactory.toString(),
      })
    );
  } catch (err) {
    dispose();
    throw err;
  }
  return {
    async compile(ctx, files) {
      using _ = ctx.onCancel(() => {
        remote.cancel();
      })
      await inContext(ctx, remote.compile(files))
      return {
        async run(ctx, input) {
          using _ = ctx.onCancel(() => {
            remote.cancel();
          });
          return await inContext(ctx, remote.test(input));
        },
        [Symbol.dispose] () {
          void remote.dispose();
        },
      };
    },
    [Symbol.dispose]: dispose,
  }
}
