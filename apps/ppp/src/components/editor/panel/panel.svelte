<script lang="ts" generics="Input, Output">
  import { untrack, type Snippet } from 'svelte';
  import type { editor } from "monaco-editor";
  import { Terminal } from '@xterm/xterm'
  import { FitAddon } from '@xterm/addon-fit'
  import '@xterm/xterm/css/xterm.css'
  
  import { createContext, type Context } from 'libs/context';
  import { createLogger } from 'libs/logger';
  import { stringifyError } from 'libs/error'
  import { ok } from 'libs/result';
  import type { Writer } from 'libs/io';
  import {
    runTests,
    type TestCase,
    type TestCompiler,
  } from "testing";
  
  import { testRunnerTimeout, type SurfaceApi, type TestCompilerFactory } from '../model';
  import { Tab } from './model';
  import { makeTheme } from './terminal'

  import TestsTab from './tests.svelte';
  import TerminalTab from './terminal.svelte';
  import SettingsTab from './settings.svelte';
  import TabsHeader from './header.svelte';

  interface Props<I, O> {
    api: SurfaceApi
    model: editor.IModel;
    testCases: TestCase<I, O>[];
    testCompilerFactory: TestCompilerFactory<I, O>;
    children: Snippet
    header: Snippet
  }

  let {
    api,
    model,
    testCases,
    testCompilerFactory,
    children,
    header
  }: Props<Input, Output> = $props();

  let isRunning = $state(false);
  let lastTestId = $state(-1);

  $effect(() => {
    testCases;
    testCompilerFactory;
    isRunning = false;
    lastTestId = -1;
  });

  let selectedTab = $state<Tab | null>(null);

  $effect(() => {
    selectedTab;
    untrack(() => {
      if (selectedTab) {
        api.showPanel(window.innerHeight/3);
      } else {
        api.hidePanel();
      }
    })
  })

  $effect(() => {
    if (api.isPanelCollapsed) {
      // untrack(() => {
        selectedTab = null
      // })
    }
  })

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

  $effect(() => {
    testCompilerFactory;
    term.clear();
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

  const termWriter: Writer = {
    write (data) {
      term.write(data)
      return ok(data.length)
    }
  }
  const logger = createLogger(termWriter)
  
  let ctx: Context | null = null
  let testCompiler: TestCompiler<Input, Output> | null = null

  $effect(() => {
    testCompilerFactory;
    testCompiler = null;
    return () => {
      if (testCompiler === null) {
        return
      }
      testCompiler[Symbol.dispose]();
      testCompiler = null;
    }
  })

  async function handleRun () {
    if (isRunning) {
      ctx?.cancel();
      return;
    }
    selectedTab = Tab.Output;
    ctx = createContext(testRunnerTimeout.value);
    isRunning = true;
    term.clear();
    try {
      if (testCompiler === null) {
        testCompiler = await testCompilerFactory(ctx, termWriter);
      }
      const runner = await testCompiler.compile(ctx, [{
        filename: 'main',
        content: model.getValue()
      }]);
      try {
        lastTestId = await runTests(ctx, logger, runner, testCases);
      } finally {
        runner[Symbol.dispose]();
      }
    } catch (err) {
      logger.error(stringifyError(err));
    } finally {
      isRunning = false;
      ctx = null;
    }
  }
</script>

<div class="grow border-t border-base-100 relative bg-base-300 flex flex-col" style="height: {api.panelHeight}px;" >
  <TabsHeader
    bind:selectedTab
    {api}
    {isRunning}
    {lastTestId}
    testsCount={testCases.length}
    onRun={handleRun}
    append={header}
  />
  <div class="grow flex flex-col overflow-hidden">
    {#if selectedTab === Tab.Tests}
      <TestsTab testsData={testCases} {lastTestId} />
    {:else if selectedTab === Tab.Settings}
      <SettingsTab />
    {:else if selectedTab === null}
      <div class="grow flex items-center justify-center text-xl">
        Select a tab
      </div>
    {/if}
    <!-- This Tab should't be unmounted -->
    <TerminalTab terminal={term} class={selectedTab !== Tab.Output ? "hidden" : ""} />
    {@render children()}
  </div>
</div>
