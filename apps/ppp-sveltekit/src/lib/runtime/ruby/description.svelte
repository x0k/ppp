<script lang="ts">
  import { version } from "ruby-runtime/version";
</script>

<p>
  Ruby {version}
</p>

<p>
  Your code is interpreted by <a
    href="https://github.com/ruby/ruby.wasm"
    class="link"
    target="_blank">CRuby</a
  > (ported to WebAssembly with stdlib) in a web worker environment.
</p>

<p>
  Notable Limitations.

  The current WASI target build does not yet support Thread related APIs.
  Also there is no support for networking.
</p>
