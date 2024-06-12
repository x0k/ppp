<script lang="ts" generics="Input, Output">
  import type { Snippet } from 'svelte';
  import type { editor } from "monaco-editor";
  import { Terminal } from '@xterm/xterm'
  import { FitAddon } from '@xterm/addon-fit'
  import '@xterm/xterm/css/xterm.css'

  import { createContext } from '@/lib/context';
  import { createLogger } from '@/lib/logger';
  import {
    runTests,
    type TestData,
    type TestRunnerFactory,
  } from "@/lib/testing";
  
  import { type SurfaceApi } from '../model';
  import { Tab } from './model';
  import { makeTheme } from './terminal'

  import TestsTab from './tests.svelte';
  import TerminalTab from './terminal.svelte';
  import SettingsTab from './settings.svelte';
  import TabsHeader from './header.svelte';

  interface Props<I, O> {
    api: SurfaceApi
    model: editor.IModel;
    testsData: TestData<I, O>[];
    testRunnerFactory: TestRunnerFactory<I, O>;
    children: Snippet
    header: Snippet
  }

  let {
    api,
    model,
    testsData,
    testRunnerFactory,
    children,
    header
  }: Props<Input, Output> = $props();

  let isRunning = $state(false);
  let lastTestId = $state(-1);

  $effect(() => {
    testsData;
    testRunnerFactory;
    isRunning = false;
    lastTestId = -1;
  });

  let selectedTab = $state<Tab>(Tab.Tests)

  const term = new Terminal({
    theme: makeTheme("business"),
    fontFamily: "monospace",
    convertEol: true,
    rows: 1,
  })
  const fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  $effect(() => () => {
    term.dispose()
  })

  let resizeFrameId: number
  $effect(() => {
    api.panelHeight;
    api.width;
    if (selectedTab !== Tab.Output) {
      return
    }
    cancelAnimationFrame(resizeFrameId)
    resizeFrameId = requestAnimationFrame(() => {
      // Fix the terminal resize to the smaller height
      term.resize(term.cols, 1)
      fitAddon.fit()
    })
    return () => {
      cancelAnimationFrame(resizeFrameId)
    }
  })

  const logger = createLogger(term)
  
  let ctx = createContext()

  async function handleRun (){
    if (isRunning) {
      ctx.cancel();
      return;
    }
    isRunning = true;
    term.clear();
    try {
      const runner = await testRunnerFactory(ctx, {
        code: model.getValue(),
        out: term,
      });
      try {
        lastTestId = await runTests(ctx, logger, runner, testsData);
      } finally {
        runner[Symbol.dispose]();
      }
    } catch (err) {
      logger.error(String(err));
    } finally {
      isRunning = false;
      ctx = createContext();
    }
  }
</script>

<div class="grow border-t border-base-100 relative flex flex-col bg-base-300 overflow-hidden">
  <TabsHeader
    bind:selectedTab
    {api}
    {isRunning}
    {lastTestId}
    testsCount={testsData.length}
    onRun={handleRun}
    append={header}
  />
  {#if selectedTab === Tab.Tests}
    <TestsTab {testsData} {lastTestId} />
  {:else if selectedTab === Tab.Settings}
    <SettingsTab />
  {/if}
  <!-- This Tab should't be unmounted -->
  <TerminalTab terminal={term} class={selectedTab !== Tab.Output ? "hidden" : ""} />
  {@render children()}
</div>
