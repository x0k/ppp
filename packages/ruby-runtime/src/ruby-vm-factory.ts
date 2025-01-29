import { RubyVM } from '@ruby/wasm-wasi'
import { Fd, PreopenDirectory, WASI, ConsoleStdout } from "@bjorn3/browser_wasi_shim";
import { inContext, type Context } from 'libs/context';
import type { Streams } from 'libs/io';

export async function createRubyVM (
  ctx: Context,
  streams: Streams,
  wasmModule: WebAssembly.Module,
) {
  const args: string[] = []
  const env: string[] = []

  const fds: Fd[] = [
    new ConsoleStdout(()=> {
      throw new Error("Stdin is not implemented")
    }),
    new ConsoleStdout(streams.out.write.bind(streams.out)),
    new ConsoleStdout(streams.err.write.bind(streams.err)),
    new PreopenDirectory("/", new Map()),
  ]
  const wasi = new WASI(args, env, fds, { debug: false })
  const vm = new RubyVM()
  const imports = {
    wasi_snapshot_preview1: wasi.wasiImport
  }
  vm.addToImports(imports)

  const instance = await inContext(ctx, WebAssembly.instantiate(wasmModule, imports))
  await inContext(ctx, vm.setInstance(instance))

  //@ts-expect-error lack of type information
  wasi.initialize(instance)
  vm.initialize()

  return vm
}
