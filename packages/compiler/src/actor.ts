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
import { createContext, inContext, type Context } from "libs/context";
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
  private ctx: Context = createContext();
  private compiler: Compiler | null = null;
  private program: Program | null = null;

  constructor(
    connection: Connection<Incoming, Outgoing>,
    compilerFactory: CompilerFactory
  ) {
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
        this.compiler = await compilerFactory(this.ctx, out);
      },
      compile: async (files) => {
        if (this.compiler === null) {
          throw new Error("Compiler not initialized");
        }
        this.program = await this.compiler.compile(this.ctx, files);
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
        await this.program.run(this.ctx);
      },
      cancel: () => {
        this.ctx.cancel();
        this.ctx = createContext();
      },
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
  compilerFactory: CompilerFactory
) {
  const connection = new WorkerConnection<Incoming, Outgoing>(
    self as unknown as Worker
  );
  const actor = new CompilerActor(connection, compilerFactory);
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

export function makeRemoteCompilerFactory(Worker: WorkerConstructor) {
  return async (ctx: Context, out: Writer): Promise<Compiler> => {
    const worker = new Worker();
    const connection = new WorkerConnection<Outgoing, Incoming>(worker);
    const stopConnection = connection.start();
    const log = createLogger(out);
    const remote = startRemote<Handlers, string, CompilerActorEvent>(
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
    const cancelSubscription = ctx.onCancel(() => {
      remote.cancel();
    });
    try {
      await inContext(ctx, remote.init());
    } catch (err) {
      dispose();
      throw err;
    } finally {
      cancelSubscription[Symbol.dispose]();
    }
    return {
      async compile(ctx, files) {
        const cancelSubscription = ctx.onCancel(() => {
          remote.cancel();
        });
        try {
          await inContext(ctx, remote.compile(files));
          return {
            async run(ctx) {
              const cancelSubscription = ctx.onCancel(() => {
                remote.cancel();
              });
              try {
                await inContext(ctx, remote.run());
              } finally {
                cancelSubscription[Symbol.dispose]();
              }
            },
            [Symbol.dispose]: () => {
              void remote.dispose();
            },
          };
        } finally {
          cancelSubscription[Symbol.dispose]();
        }
      },
      [Symbol.dispose]: dispose,
    };
  };
}
