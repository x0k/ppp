<script lang="ts">
  import { version } from "dotnet-runtime/version";
  import { LIBS } from "@/lib/factories/dotnet";
</script>

<p>
  .NET {version}
</p>

<p>
  Your code is compiled by the Roslyn compiler (compiled to WebAssembly with a
  several .NET assemblies) and is executed in the context of the current page.
</p>

<p>Available libraries:</p>

<div class="grid grid-flow-row grid-cols-2 gap-x-2">
  {#each LIBS as lib}
    <p class="truncate">
      {lib}
    </p>
  {/each}
</div>
