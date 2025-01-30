import {
  Actor,
  MessageType,
  startRemote,
  WorkerConnection,
  type Connection,
  type EventMessage,
  type IncomingMessage,
  type OutgoingMessage,
} from "libs/actor";
import {
  CanceledError,
  createContext,
  createRecoverableContext,
  withCancel,
  type Context,
} from "libs/context";
import type { Streams } from "libs/io";
import { stringifyError } from "libs/error";
import { createLogger } from "libs/logger";
import { SharedQueue, StreamType, createSharedStreamsClient, createSharedStreamsServer } from 'libs/sync';

import type { Compiler, CompilerFactory, File, Program } from "./compiler.js";

interface Handlers {
  [key: string]: any;
  initialize(buffer: SharedArrayBuffer | ArrayBuffer): Promise<void>;
  destroy(): void;

  compile(files: File[]): Promise<void>;
  stopCompile(): void;

  run(): Promise<void>;
  stopRun(): void;
}

type Incoming = IncomingMessage<Handlers>;

interface WriteEventMessage extends EventMessage<"write", { type: StreamType, data: Uint8Array }> {}

type CompilerActorEvent = WriteEventMessage;

type Outgoing = OutgoingMessage<Handlers, string> | CompilerActorEvent;

class CompilerActor extends Actor<Handlers, string> implements Disposable {
  protected compiler: Compiler<Program> | null = null;
  protected compilerCtx = createRecoverableContext(() => {
    this.compiler = null
    return withCancel(createContext())
  })
  protected program: Program | null = null
  protected programCtx = createRecoverableContext(() => {
    this.program = null
    return withCancel(this.compilerCtx.ref)
  })
  protected runCtx = createRecoverableContext(() => withCancel(this.programCtx.ref))

  constructor(
    connection: Connection<Incoming, Outgoing>,
    compilerFactory: CompilerFactory<Program>
  ) {
    const handlers: Handlers = {
      initialize: async (buffer: SharedArrayBuffer) => {
        const sharedQueue = new SharedQueue(buffer)
        const streams = createSharedStreamsClient(
          sharedQueue,
          (type, data) => connection.send({
            type: MessageType.Event,
            event: "write",
            payload: {
              type,
              data
            }
          })
        )
        this.compiler = await compilerFactory(this.compilerCtx.ref, streams);
      },
      destroy: () => {
        this.compilerCtx.cancel()
      },
      compile: async (files) => {
        if (this.compiler === null) {
          throw new Error("Compiler not initialized");
        }
        this.program = await this.compiler.compile(this.programCtx.ref, files);
      },
      stopCompile: () => {
        this.programCtx.cancel()
      },
      run: async () => {
        if (this.program === null) {
          const err = new Error("Program not compiled");
          connection.send({
            type: MessageType.Event,
            event: "error",
            payload: err.message,
          });
          throw err;
        }
        try {
          await this.program.run(this.runCtx.ref);
        } finally {
          this.runCtx.cancel();
        }
      },
      stopRun: () => {
        this.runCtx.cancel();
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

export function startCompilerActor(
  ctx: Context,
  compilerFactory: CompilerFactory<Program>
) {
  const connection = new WorkerConnection<Incoming, Outgoing>(
    self as unknown as Worker
  );
  connection.start(ctx);
  const actor = new CompilerActor(connection, compilerFactory);
  const disposable = ctx.onCancel(() => {
    disposable[Symbol.dispose]()
    actor[Symbol.dispose]()
  })
  actor.start(ctx);
}

interface WorkerConstructor {
  new (): Worker;
}

export function makeRemoteCompilerFactory(Worker: WorkerConstructor) {
  return async (ctx: Context, streams: Streams): Promise<Compiler<Program>> => {
    const worker = new Worker();
    const sub = streams.in.onData((data) => {
      if (data.length !== 0) {
        return
      }
      server.write()
      // Will write an empty array for EOF
      server.write()
    })
    const disposable = ctx.onCancel(() => {
      disposable[Symbol.dispose]()
      sub[Symbol.dispose]()
      worker.terminate()
    })
    const connection = new WorkerConnection<Outgoing, Incoming>(worker);
    connection.start(ctx);
    const log = createLogger(streams.out);
    const remote = startRemote<Handlers, string, CompilerActorEvent>(
      ctx,
      log,
      connection,
      {
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
    const buffer = new Buffer(1024 * 1024)
    await remote.initialize(buffer);
    const server = createSharedStreamsServer(new SharedQueue(buffer), streams)
    return {
      async compile(ctx, files) {
        using _ = ctx.onCancel(() => remote.stopCompile())
        await remote.compile(files);
        return {
          async run(ctx) {
            using _ = ctx.onCancel(() => remote.stopRun())
            await remote.run();
          }
        };
      },
    };
  };
}
