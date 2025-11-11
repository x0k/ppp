<script lang="ts" generics="Langs extends Language, Input, Output">
	import { untrack } from 'svelte';
	import { innerWidth, innerHeight } from 'svelte/reactivity/window';
	import { editor } from 'monaco-editor';
	import { stringifyError } from 'libs/error';
	import { createLogger } from 'libs/logger';
	import { createContext, createRecoverableContext, withCancel, withTimeout } from 'libs/context';
	import { runTests, type TestCompiler } from 'libs/testing';
	import LucideInfo from '~icons/lucide/info';
	import LucideCircleX from '~icons/lucide/circle-x';
	import LucideCircleCheck from '~icons/lucide/circle-check';
	import LucideCircleDashed from '~icons/lucide/circle-dashed';
	import LucideChevronLeft from '~icons/lucide/chevron-left';
	import LucideChevronRight from '~icons/lucide/chevron-right';
	import LucideShuffle from '~icons/lucide/shuffle';
	import LucideRotateCcw from '~icons/lucide/rotate-ccw';

	import { debouncedSave, immediateSave } from '$lib/sync-storage.svelte';
	import { PROBLEM_CATEGORY_TO_LABEL, problemCategoryPage } from '$lib/problem';
	import { LANGUAGE_TITLE, Language } from '$lib/language';
	import { EditorPanelTab } from '$lib/editor-panel-tab';
	import { MONACO_LANGUAGE_ID } from '$lib/monaco';
	import { createSyncStorage } from '$lib/storage';
	import { DESCRIPTIONS } from '$lib/runtime/test-descriptions';
	import Logo from '$lib/components/logo.svelte';
	import Dropdown from '$lib/components/dropdown.svelte';
	import ResizablePanel from '$lib/components/resizable-panel.svelte';
	import {
		Editor,
		VimStatus,
		RunButton,
		createTerminal,
		EditorContext,
		setEditorContext,
		type ProcessStatus,
		createStreams
	} from '$lib/components/editor';
	import {
		Panel,
		PanelToggle,
		Tab,
		Tabs,
		TerminalTab,
		TabContent
	} from '$lib/components/editor/panel';
	import { CheckBox, Number } from '$lib/components/editor/controls';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	import {
		DESCRIPTION_PANEL_FLIP_POINT,
		DESCRIPTION_PANEL_MIN_WIDTH,
		EDITOR_MIN_WIDTH,
		type Props
	} from './model';
	import { LANGUAGE_ICONS } from '$lib/language-icons.svelte';
	import EditorProvider from '$lib/editor-provider.svelte';

	const { problemCategory, contentId, testCases, runtimes, children }: Props<Langs, Input, Output> =
		$props();

	const languages = Object.keys(runtimes).sort() as Langs[];
	if (languages.length === 0) {
		throw new Error('No test runner factories provided');
	}
	const defaultLang = languages[0];
	const langStorage = createSyncStorage(localStorage, 'test-editor-lang', defaultLang);
	const initialLang = langStorage.load();
	let lang = $state(initialLang in runtimes ? initialLang : defaultLang);
	immediateSave(langStorage, () => lang);
	let runtime = $derived(runtimes[lang]);
	let contentStorage = $derived(
		createSyncStorage(
			sessionStorage,
			`test-editor-content-${contentId}-${lang}`,
			runtime.initialValue
		)
	);

	const model = editor.createModel('');
	$effect(() => {
		model.setValue(contentStorage.load());
		editor.setModelLanguage(model, MONACO_LANGUAGE_ID[lang]);

		let saveCallbackId: NodeJS.Timeout;
		const disposable = model.onDidChangeContent(() => {
			clearTimeout(saveCallbackId);
			saveCallbackId = setTimeout(() => {
				contentStorage.save(model.getValue());
			}, 1000);
			return () => {
				clearTimeout(saveCallbackId);
			};
		});

		return () => {
			clearTimeout(saveCallbackId);
			disposable.dispose();
		};
	});

	const { terminal, fitAddon } = createTerminal();
	const streams = createStreams(terminal);

	const editorContext = new EditorContext(model, terminal, fitAddon);
	setEditorContext(editorContext);

	const editorWidthStorage = createSyncStorage(
		localStorage,
		'test-editor-width',
		Math.round((innerWidth.current! / 3) * 2)
	);
	let editorWidth = $state(editorWidthStorage.load());
	debouncedSave(editorWidthStorage, () => editorWidth, 300);
	function normalizeWidth(width: number) {
		const windowWidth = innerWidth.current!;
		const newEditorWidth = Math.max(EDITOR_MIN_WIDTH, Math.min(windowWidth, width));
		const diff = windowWidth - newEditorWidth;
		if (windowWidth < DESCRIPTION_PANEL_MIN_WIDTH) {
			return newEditorWidth;
		}
		if (diff < DESCRIPTION_PANEL_FLIP_POINT) {
			return windowWidth;
		}
		if (diff < DESCRIPTION_PANEL_MIN_WIDTH) {
			return windowWidth - DESCRIPTION_PANEL_MIN_WIDTH;
		}
		return newEditorWidth;
	}
	let lastWindowWidth = innerWidth.current!;
	$effect(() => {
		const newWidth = innerWidth.current!;
		untrack(() => {
			editorWidth = normalizeWidth(editorWidth + newWidth - lastWindowWidth);
		});
		lastWindowWidth = newWidth;
	});

	const panelHeightStorage = createSyncStorage(
		localStorage,
		'test-editor-panel-height',
		Math.round(innerHeight.current! / 3)
	);
	let panelHeight = $state(panelHeightStorage.load());
	debouncedSave(panelHeightStorage, () => panelHeight, 300);

	const vimStateStorage = createSyncStorage(localStorage, 'test-editor-vim-state', false);
	let vimState = $state(vimStateStorage.load());
	immediateSave(vimStateStorage, () => vimState);

	const executionTimeoutStorage = createSyncStorage(
		localStorage,
		'test-editor-execution-timeout',
		60000
	);
	let executionTimeout = $state(executionTimeoutStorage.load());
	debouncedSave(executionTimeoutStorage, () => executionTimeout, 100);

	const terminalLogger = createLogger(streams.out);
	let testCompilerFactory = $derived(runtime.testCompilerFactory);
	let status = $state<ProcessStatus>('stopped');
	let lastTestId = $state(-1);
	let testCompiler: TestCompiler<Input, Output> | null = null;
	const compilerCtx = createRecoverableContext(() => {
		testCompiler = null;
		lastTestId = -1;
		return withCancel(createContext());
	});
	$effect(() => () => compilerCtx[Symbol.dispose]());
	$effect(() => {
		testCompilerFactory;
		compilerCtx.cancel();
		status = 'stopped';
	});
	const programCtx = createRecoverableContext(() => withCancel(compilerCtx.ref));
	$effect(() => () => programCtx[Symbol.dispose]());

	async function handleRun() {
		if (status === 'running') {
			compilerCtx.cancel();
			return;
		}
		const programCtxWithTimeout = withTimeout(programCtx.ref, executionTimeout);
		status = 'running';
		terminal.reset();
		try {
			if (testCompiler === null) {
				testCompiler = await testCompilerFactory(compilerCtx.ref, streams);
			}
			const testProgram = await testCompiler.compile(programCtxWithTimeout, [
				{
					filename: 'main',
					content: model.getValue()
				}
			]);
			lastTestId = await runTests(programCtxWithTimeout, terminalLogger, testProgram, testCases);
		} catch (err) {
			console.error(err);
			terminalLogger.error(stringifyError(err));
		} finally {
			programCtx.cancel();
			status = 'stopped';
		}
	}

	function handleReset() {
		model.setValue(runtime.initialValue);
		editorContext.editor?.focus();
	}

	let descriptionDialogElement: HTMLDialogElement;
	let describedLanguage = $state(defaultLang);
	let Description = $derived(DESCRIPTIONS[describedLanguage]);
</script>

<div class="flex h-screen">
	<div class="h-full overflow-auto" style="width: {innerWidth.current! - editorWidth}px">
		<div class="p-6">
			<div class="mb-8 flex items-center gap-3">
				<Logo />
				<div class="breadcrumbs">
					<ul>
						<li>
							<a href={localizeHref(problemCategoryPage(problemCategory))}
								>{PROBLEM_CATEGORY_TO_LABEL[problemCategory]()}</a
							>
						</li>
					</ul>
				</div>
				<div class="ml-auto join rounded">
					<button class="btn join-item btn-ghost btn-lg"><LucideChevronLeft /></button>
					<button class="btn join-item btn-ghost btn-lg"><LucideChevronRight /></button>
					<button class="btn join-item btn-ghost btn-lg"><LucideShuffle /></button>
					<button onclick={handleReset} class="btn join-item btn-ghost btn-lg"
						><LucideRotateCcw /></button
					>
				</div>
			</div>
			<div class="prose prose-lg max-w-none">
				{@render children()}
			</div>
		</div>
	</div>
	<ResizablePanel
		normalizeSize={normalizeWidth}
		class="relative flex min-w-0 grow flex-col overflow-hidden"
		bind:size={editorWidth}
	>
		<EditorProvider>
			<Editor width={editorWidth} height={innerHeight.current! - panelHeight} />
		</EditorProvider>
		<Panel bind:height={panelHeight} maxHeight={innerHeight.current!}>
			<div class="flex flex-wrap items-center gap-1 p-0.5">
				<RunButton {status} onClick={handleRun} />
				<Tabs>
					<Tab tab={EditorPanelTab.Output} />
					<Tab tab={EditorPanelTab.Tests}>
						{#snippet append()}
							<div
								class={[
									'badge rounded-xs',
									lastTestId < 0 && 'hidden',
									lastTestId < testCases.length && lastTestId >= 0 && 'badge-error',
									lastTestId === testCases.length && 'badge-success'
								]}
							>
								{lastTestId}/{testCases.length}
							</div>
						{/snippet}
					</Tab>
					<Tab tab={EditorPanelTab.Settings} />
				</Tabs>
				<div class="grow"></div>
				<VimStatus bind:vimState />
				<Dropdown bind:value={lang} options={languages}>
					{#snippet preLabel(lang)}
						{@const Icon = LANGUAGE_ICONS[lang]}
						<Icon />
					{/snippet}
					{#snippet label(lang)}
						{LANGUAGE_TITLE[lang]}
					{/snippet}
					{#snippet postLabel(lang)}
						<LucideInfo
							onclick={(e) => {
								describedLanguage = lang;
								e.stopPropagation();
								descriptionDialogElement.showModal();
							}}
							class="invisible group-hover:visible"
						/>
					{/snippet}
				</Dropdown>
				<PanelToggle bind:panelHeight maxPanelHeight={innerHeight.current!} />
			</div>
			<div class="flex grow flex-col overflow-hidden">
				<TerminalTab width={innerWidth.current!} height={panelHeight} class="mt-4 ml-4 grow" />
				<TabContent tab={EditorPanelTab.Tests}>
					<div class="flex flex-col gap-4 overflow-auto p-4">
						{#each testCases as testCase, i}
							<div>
								<div class="flex items-center gap-2 pb-2">
									{#if lastTestId === i}
										<LucideCircleX class="text-error" />
									{:else if i < lastTestId}
										<LucideCircleCheck class="text-success" />
									{:else}
										<LucideCircleDashed />
									{/if}
									Case {i + 1}
								</div>
								<pre class="rounded bg-base-100 p-2"><code
										>{JSON.stringify(testCase.input, null, 2)}</code
									></pre>
							</div>
						{/each}
					</div>
				</TabContent>
				<TabContent tab={EditorPanelTab.Settings}>
					<div class="flex flex-col gap-4 overflow-auto p-4">
						<CheckBox title={m.vimMode()} bind:value={vimState} />
						<Number
							title={m.executionTimeout()}
							alt={m.executionTimeoutDescription()}
							bind:value={executionTimeout}
						/>
					</div>
				</TabContent>
			</div>
		</Panel>
	</ResizablePanel>
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog bind:this={descriptionDialogElement} class="modal" onclick={(e) => e.stopPropagation()}>
	<div class="modal-box w-full max-w-2xl">
		<form method="dialog">
			<button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">✕</button>
		</form>
		<h3 class="text-lg font-bold">{LANGUAGE_TITLE[describedLanguage]}</h3>
		<div class="flex flex-col items-start gap-2 py-4">
			<Description />
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
