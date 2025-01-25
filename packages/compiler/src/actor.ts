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

import type { Compiler, CompilerFactory, File, Program } from "./compiler.js";
import {
  createContext,
  inContext,
  withCancel,
  type Context,
} from "libs/context";
import type { Writer } from "libs/io";
import { ok } from "libs/result";
import { stringifyError } from "libs/error";
import { createLogger } from "libs/logger";

interface Handlers {
  [key: string]: any;
  init(): Promise<void>;
  compile(files: File[]): Promise<void>;
  run(): Promise<void>;
  cancel(): void;
  dispose(): void;
}

type Incoming = IncomingMessage<Handlers>;

interface WriteEventMessage extends EventMessage<"write", Uint8Array> {}

type CompilerActorEvent = WriteEventMessage;

type Outgoing = OutgoingMessage<Handlers, string> | CompilerActorEvent;

class CompilerActor extends Actor<Handlers, string> {
  private ctxWithCancel = withCancel(createContext());
  private compiler: Compiler | null = null;
  private program: Program | null = null;

  constructor(
    connection: Connection<Incoming, Outgoing>,
    compilerFactory: CompilerFactory
  ) {
    const cancel = () => {
      this.ctxWithCancel[1]();
      this.ctxWithCancel = withCancel(createContext());
    };
    const handlers: Handlers = {
      init: async () => {
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
          this.compiler = await compilerFactory(this.ctxWithCancel[0], out);
        } finally {
          cancel();
        }
      },
      compile: async (files) => {
        if (this.compiler === null) {
          throw new Error("Compiler not initialized");
        }
        try {
          this.program = await this.compiler.compile(
            this.ctxWithCancel[0],
            files
          );
        } finally {
          cancel()
        }
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
          await this.program.run(this.ctxWithCancel[0]);
        } finally {
          cancel()
        }
      },
      cancel,
      dispose: () => {
        if (this.program !== null) {
          this.program[Symbol.dispose]();
        }
        if (this.compiler !== null) {
          this.compiler[Symbol.dispose]();
        }
      },
    };
    super(connection, handlers, stringifyError);
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
  actor.start(ctx);
}

interface WorkerConstructor {
  new (): Worker;
}

export function makeRemoteCompilerFactory(Worker: WorkerConstructor) {
  return async (ctx: Context, out: Writer): Promise<Compiler> => {
    const worker = new Worker();
    const connection = new WorkerConnection<Outgoing, Incoming>(worker);
    connection.start(ctx);
    const log = createLogger(out);
    const remote = startRemote<Handlers, string, CompilerActorEvent>(
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
      await inContext(ctx, remote.init());
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
            async run(ctx) {
              ctx.signal.addEventListener("abort", cancelRemote);
              try {
                await inContext(ctx, remote.run());
              } finally {
                ctx.signal.removeEventListener("abort", cancelRemote);
              }
            },
            [Symbol.dispose]: () => {
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
