<script lang="ts">
  import { version } from "dotnet-runtime/version";

  import { LIBS } from "./test-compiler-factory";

  const libs = LIBS.map(l => {
    const i = l.lastIndexOf('/')
    return i < 0 ? l : l.slice(i+1)
  })
</script>

<p>
  .NET {version}
</p>

<p>
  Your code is compiled by the Roslyn compiler (compiled to WebAssembly with a
  several .NET assemblies) and is executed in a web worker environment.
</p>

<p>Available libraries:</p>

<div class="grid grid-flow-row grid-cols-2 gap-x-2">
  {#each libs as lib}
    <p class="truncate">
      {lib}
    </p>
  {/each}
</div>
