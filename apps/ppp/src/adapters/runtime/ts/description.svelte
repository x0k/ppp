<script lang="ts">
  import { version } from "typescript-runtime/version";
</script>

<p>TypeScript {version}. Transpilation options:</p>

<pre>
<code>
target: ScriptTarget.ES2022,
strict: true,
strictBindCallApply: true,
strictFunctionTypes: true,
</code>
</pre>

<p>Transpiled code is executed in a web worker environment.</p>

<p>
  <a
    class="link"
    target="_blank"
    href="https://compat-table.github.io/compat-table/es2016plus/"
  >
    Check supported features in your browser
  </a>.
</p>
