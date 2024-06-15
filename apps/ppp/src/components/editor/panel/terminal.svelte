<script lang="ts">
  import type { Terminal } from "@xterm/xterm";

  interface Props {
    class: string;
    terminal: Terminal;
  }

  const { terminal, class: className }: Props = $props();

  let termElement: HTMLDivElement;

  // NOTE: no `dispose` here
  // https://github.com/xtermjs/xterm.js/issues/3939#issuecomment-1195377718
  $effect(() => {
    terminal.open(termElement);
  });
</script>

<div bind:this={termElement} class="grow ml-4 mt-4 {className}"></div>
