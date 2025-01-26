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
import type { Writer } from "libs/io";
import { ok } from "libs/result";
import { stringifyError } from "libs/error";
import { createLogger } from "libs/logger";

import type { Compiler, CompilerFactory, File, Program } from "./compiler.js";

interface Handlers {
  [key: string]: any;
  initialize(): Promise<void>;
  destroy(): void;

  compile(files: File[]): Promise<void>;
  stopCompile(): void;

  run(): Promise<void>;
  stopRun(): void;
}

type Incoming = IncomingMessage<Handlers>;

interface WriteEventMessage extends EventMessage<"write", Uint8Array> {}

type CompilerActorEvent = WriteEventMessage;

type Outgoing = OutgoingMessage<Handlers, string> | CompilerActorEvent;

class CompilerActor extends Actor<Handlers, string> implements Disposable {
  protected compiler: Compiler | null = null;
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
    compilerFactory: CompilerFactory
  ) {
    const handlers: Handlers = {
      initialize: async () => {
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
        this.compiler = await compilerFactory(this.compilerCtx.ref, out);
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
  compilerFactory: CompilerFactory
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
  return async (ctx: Context, out: Writer): Promise<Compiler> => {
    const worker = new Worker();
    const disposable = ctx.onCancel(() => {
      disposable[Symbol.dispose]()
      worker.terminate()
    })
    const connection = new WorkerConnection<Outgoing, Incoming>(worker);
    connection.start(ctx);
    const log = createLogger(out);
    const remote = startRemote<Handlers, string, CompilerActorEvent>(
      ctx,
      log,
      connection,
      {
        error: (err) => {
          log.error(err instanceof CanceledError ? err.message : err);
        },
        write: (text) => {
          out.write(text);
        },
      }
    );
    using _ = ctx.onCancel(() => remote.destroy())
    await remote.initialize();
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
