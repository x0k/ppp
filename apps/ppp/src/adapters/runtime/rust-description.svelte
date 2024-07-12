<script lang="ts">
  import { version } from "testing-rust/version";
</script>

<p>
  Rust {version}
</p>

<p>
  Your code is interpreted by <a
    href="https://github.com/rust-lang/miri"
    class="link"
    target="_blank">Miri</a
  > (compiled to WebAssembly) in a web worker environment.
</p>

<p>Anything not supported by Miri or WASM is unsupported.</p>

<p>
  This solution is based on <a
    class="link"
    href="https://github.com/bjorn3"
    target="_blank">bjorn3</a
  >
  work on
  <a
    class="link"
    target="_blank"
    href="https://github.com/rust-lang/miri/issues/722#issuecomment-1960849880"
    >porting Rust to WebAssembly</a
  >
  and
  <a
    href="https://github.com/bjorn3/browser_wasi_shim"
    class="link"
    target="_blank">browser WASI shim</a
  >.
</p>
