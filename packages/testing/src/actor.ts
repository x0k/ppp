import {
  createContext,
  createRecoverableContext,
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
import type { Compiler, File, Program } from "compiler";
import type { Writer } from "libs/io";
import { ok } from "libs/result";

import type { TestProgram, TestCompiler } from "./testing.js";

export interface InitConfig {
  universalFactoryFunction: string;
}

interface Handlers<I, O> {
  [key: string]: any;
  initialize(config: InitConfig): Promise<void>;
  destroy(): void;

  compile(files: File[]): Promise<void>;
  stopCompile(): void;

  test(data: I): Promise<O>;
  stopTest(): void;
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

class TestCompilerActor<D, I, O> extends Actor<Handlers<I, O>, string> implements Disposable {
  protected compiler: TestCompiler<I, O> | null = null;
  protected compilerCtx = createRecoverableContext(() => {
    this.compiler = null
    return withCancel(createContext())
  })
  protected program: TestProgram<I, O> | null = null
  protected programCtx = createRecoverableContext(() => {
    this.program = null
    return withCancel(this.compilerCtx[0])
  })
  protected runCtx = createRecoverableContext(() => withCancel(this.programCtx[0]))

  constructor(
    connection: Connection<Incoming<I, O>, Outgoing<I, O>>,
    superFactory: TestCompilerFactory<D, I, O>
  ) {
    const handlers: Handlers<I, O> = {
      initialize: async({ universalFactoryFunction }) => {
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
        this.compiler = await superFactory(
          this.compilerCtx[0],
          out,
          universalFactory
        );
      },
      destroy: () => {
        this.compilerCtx[1]()
      },
      compile: async (files) => {
        if (this.compiler === null) {
          throw new Error("Test runner not initialized");
        }
        this.program = await this.compiler.compile(
          this.programCtx[0],
          files
        );
      },
      stopCompile: () => {
        this.programCtx[1]()
      },
      test: async(input) => {
        if (this.program === null) {
          const err = new Error("Test runner not initialized");
          connection.send({
            type: MessageType.Event,
            event: "error",
            payload: err.message,
          });
          throw err;
        }
        try {
          return this.program.run(this.runCtx[0], input);
        } finally {
          this.runCtx[1]()
        }
      },
      stopTest: () => {
        this.runCtx[1]()
      },
    };
    super(connection, handlers, stringifyError);
  }

  [Symbol.dispose] (): void {
    this.compiler = null;
    this.compilerCtx[2][Symbol.dispose]()
    this.program = null;
    this.programCtx[2][Symbol.dispose]()
    this.runCtx[2][Symbol.dispose]()
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
  const disposable = ctx.onCancel(() => {
    disposable[Symbol.dispose]()
    actor[Symbol.dispose]()
  })
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
    const disposable = ctx.onCancel(() => {
      disposable[Symbol.dispose]()
      worker.terminate()
    })
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
    using _ = ctx.onCancel(() => remote.destroy())
    await remote.initialize({
      universalFactoryFunction: universalFactory.toString(),
    });
    return {
      async compile(ctx, files) {
        using _ = ctx.onCancel(() => remote.stopCompile())
        await inContext(ctx, remote.compile(files));
        return {
          async run(ctx, input) {
            using _ = ctx.onCancel(() => remote.stopTest())
            return await inContext(ctx, remote.test(input));
          }
        }
      },
    };
  };
}
