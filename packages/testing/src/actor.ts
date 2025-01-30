import {
  CanceledError,
  createContext,
  createRecoverableContext,
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
import type { Streams } from "libs/io";
import { createSharedStreamsClient, createSharedStreamsServer, SharedQueue, StreamType } from 'libs/sync';
import type { File } from "compiler";

import type { TestProgram, TestCompiler } from "./testing.js";

export interface InitConfig {
  buffer: ArrayBuffer | SharedArrayBuffer;
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

interface InputRequestEventMessage extends EventMessage<"inputRequest", undefined> {}

interface WriteEventMessage extends EventMessage<"write", { type: StreamType, data: Uint8Array }> {}

type TestingActorEvent = WriteEventMessage | InputRequestEventMessage;

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

export type TestCompilerSuperFactory<D, I, O> = (
  ctx: Context,
  streams: Streams,
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
    return withCancel(this.compilerCtx.ref)
  })
  protected runCtx = createRecoverableContext(() => withCancel(this.programCtx.ref))

  constructor(
    connection: Connection<Incoming<I, O>, Outgoing<I, O>>,
    superFactory: TestCompilerSuperFactory<D, I, O>
  ) {
    const handlers: Handlers<I, O> = {
      initialize: async({ universalFactoryFunction, buffer }) => {
        const universalFactory = await evalEntity<UniversalFactory<D, I, O>>(
          universalFactoryFunction
        );
        const sharedQueue = new SharedQueue(buffer)
        const client = createSharedStreamsClient(
          sharedQueue,
          () => {
            connection.send({
              type: MessageType.Event,
              event: "inputRequest",
              payload: undefined
            })
          },
          (type, data) => {
          connection.send({
            type: MessageType.Event,
            event: "write",
            payload: {
              type,
              data
            }
          })
        })
        this.compiler = await superFactory(
          this.compilerCtx.ref,
          client,
          universalFactory
        );
      },
      destroy: () => {
        this.compilerCtx.cancel()
      },
      compile: async (files) => {
        if (this.compiler === null) {
          throw new Error("Test runner not initialized");
        }
        this.program = await this.compiler.compile(
          this.programCtx.ref,
          files
        );
      },
      stopCompile: () => {
        this.programCtx.cancel()
      },
      test: async (input) => {
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
          return await this.program.run(this.runCtx.ref, input);
        } finally {
          this.runCtx.cancel()
        }
      },
      stopTest: () => {
        this.runCtx.cancel()
      },
    };
    super(connection, handlers, stringifyError);
  }

  [Symbol.dispose] (): void {
    this.compiler = null;
    this.compilerCtx[Symbol.dispose]()
    this.program = null;
    this.programCtx[Symbol.dispose]()
    this.runCtx[Symbol.dispose]()
  }
}

export function startTestCompilerActor<D, I = unknown, O = unknown>(
  ctx: Context,
  superFactory: TestCompilerSuperFactory<D, I, O>
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
  return async (ctx: Context, streams: Streams): Promise<TestCompiler<I, O>> => {
    const worker = new Worker();
    const disposable = ctx.onCancel(() => {
      disposable[Symbol.dispose]()
      worker.terminate()
    })
    const connection = new WorkerConnection<Outgoing<I, O>, Incoming<I, O>>(
      worker
    );
    connection.start(ctx);
    const log = createLogger(streams.out);
    const remote = startRemote<Handlers<I, O>, string, TestingActorEvent>(
      ctx,
      log,
      connection,
      {
        inputRequest() {
          server.write()
        },
        write({ type, data }) {
          server.onClientWrite(type, data)
        },
        error(err) {
          log.error(err instanceof CanceledError ? err.message : err);
        },
      }
    );
    using _ = ctx.onCancel(() => remote.destroy())
    const Buffer = window.SharedArrayBuffer
      ? SharedArrayBuffer
      : ArrayBuffer;
    const buffer = new Buffer(1024 * 1024 * 10)
    await remote.initialize({
      universalFactoryFunction: universalFactory.toString(),
      buffer
    });
    const server = createSharedStreamsServer(new SharedQueue(buffer), streams)
    return {
      async compile(ctx, files) {
        using _ = ctx.onCancel(() => remote.stopCompile())
        await remote.compile(files);
        return {
          async run(ctx, input) {
            using _ = ctx.onCancel(() => remote.stopTest())
            return await remote.test(input);
          }
        }
      },
    };
  };
}
