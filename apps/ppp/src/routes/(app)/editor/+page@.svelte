<script lang="ts">
	import { innerWidth, innerHeight } from 'svelte/reactivity/window';
	import { editor } from 'monaco-editor';
	import LucideGithub from '~icons/lucide/github';
	import LucideInfo from '~icons/lucide/info';

	import { createContext, createRecoverableContext, withCancel, withTimeout } from 'libs/context';
	import { createLogger } from 'libs/logger';
	import { stringifyError } from 'libs/error';
	import type { Compiler, Program } from 'libs/compiler';

	import { debouncedSave, immediateSave } from '$lib/sync-storage.svelte';
	import { Language, LANGUAGE_TITLE, LANGUAGE_ICONS } from '$lib/language';
	import { EditorPanelTab } from '$lib/editor-panel-tab';
	import { createSyncStorage } from '$lib/storage';
	import { MONACO_LANGUAGE_ID } from '$lib/monaco';
	import { DESCRIPTIONS } from '$lib/runtime/descriptions';
	import Dropdown from '$lib/components/dropdown.svelte';
	import {
		Editor,
		EditorContext,
		setEditorContext,
		VimStatus,
		createTerminal,
		RunButton,
		type ProcessStatus,
		createReadableStream,
		createLineInputMode
	} from '$lib/components/editor';
	import {
		Panel,
		Tab,
		Tabs,
		TerminalTab,
		TabContent,
		PanelToggle
	} from '$lib/components/editor/panel';
	import { CheckBox, Number } from '$lib/components/editor/controls';
	import { m } from '$lib/paraglide/messages';
	import EditorProvider from '$lib/editor-provider.svelte';

	import { RUNTIMES } from './runtimes';

	const languages = Object.keys(RUNTIMES).sort() as Language[];
	if (languages.length === 0) {
		throw new Error('No test runner factories provided');
	}
	const defaultLang = languages[0];
	const langStorage = createSyncStorage(localStorage, 'editor-lang', defaultLang);
	const initialLang = langStorage.load();
	let lang = $state(initialLang in RUNTIMES ? initialLang : defaultLang);
	immediateSave(langStorage, () => lang);
	let runtime = $derived(RUNTIMES[lang]);
	let contentStorage = $derived(
		createSyncStorage(sessionStorage, `editor-content-${lang}`, runtime.initialValue)
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
	const input = createReadableStream(terminal)
		.pipeThrough(createLineInputMode(terminal))

	setEditorContext(new EditorContext(model, terminal, fitAddon));

	const panelHeightStorage = createSyncStorage(
		localStorage,
		'editor-panel-height',
		Math.round(innerHeight.current! / 3)
	);
	let panelHeight = $state(panelHeightStorage.load());
	debouncedSave(panelHeightStorage, () => panelHeight, 300);

	const vimStateStorage = createSyncStorage(localStorage, 'editor-vim-state', false);
	let vimState = $state(vimStateStorage.load());
	immediateSave(vimStateStorage, () => vimState);

	const executionTimeoutStorage = createSyncStorage(
		localStorage,
		'editor-execution-timeout',
		60000
	);
	let executionTimeout = $state(executionTimeoutStorage.load());
	debouncedSave(executionTimeoutStorage, () => executionTimeout, 100);

	const terminalLogger = createLogger(terminal);
	let compilerFactory = $derived(runtime.compilerFactory);
	let status = $state<ProcessStatus>('stopped');
	let compiler: Compiler<Program> | null = null;
	const compilerCtx = createRecoverableContext(() => {
		compiler = null;
		return withCancel(createContext());
	});
	$effect(() => () => compilerCtx[Symbol.dispose]());
	$effect(() => {
		compilerFactory;
		compilerCtx.cancel();
		status = 'stopped';
	});
	const programCtx = createRecoverableContext(() => withCancel(compilerCtx.ref));
	$effect(() => () => programCtx[Symbol.dispose]());

	async function handleRun() {
		if (status === 'running') {
			// At the moment, programs do not know how to stop
			// So the only way to stop them is to kill the worker
			// But in the future we can use `programCtxWithCancel[1]` to stop programs normally
			compilerCtx.cancel();
			return;
		}
		const programCtxWithTimeout = withTimeout(programCtx.ref, executionTimeout);
		status = 'running';
		terminal.reset();
		try {
			if (compiler === null) {
				compiler = await compilerFactory(compilerCtx.ref, { input, output: terminal });
			}
			const program = await compiler.compile(programCtxWithTimeout, [
				{
					filename: 'main',
					content: model.getValue()
				}
			]);
			await program.run(programCtxWithTimeout);
		} catch (err) {
			console.error(err);
			terminalLogger.error(stringifyError(err));
		} finally {
			programCtx.cancel();
			status = 'stopped';
		}
	}

	let descriptionDialogElement: HTMLDialogElement;
	let describedLanguage = $state(defaultLang);
	let Description = $derived(DESCRIPTIONS[describedLanguage]);
</script>

<div class="flex h-screen flex-col overflow-hidden">
	<EditorProvider>
		<Editor width={innerWidth.current!} height={innerHeight.current! - panelHeight} />
		<Panel bind:height={panelHeight} maxHeight={innerHeight.current!}>
			<div class="flex flex-wrap items-center gap-1 p-0.5">
				<RunButton {status} onClick={handleRun} />
				<Tabs>
					<Tab tab={EditorPanelTab.Output} />
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
					{#snippet children()}
						<li>
							<a target="_blank" href="https://github.com/x0k/ppp">
								<LucideGithub />
								<span class="font-[sans-serif]"> GitHub </span>
							</a>
						</li>
					{/snippet}
				</Dropdown>
				<PanelToggle bind:panelHeight maxPanelHeight={innerHeight.current!} />
			</div>
			<div class="flex grow flex-col overflow-hidden">
				<TerminalTab width={innerWidth.current!} height={panelHeight} class="mt-4 ml-4 grow" />
				<TabContent tab={EditorPanelTab.Settings}>
					<div class="flex flex-col gap-4 overflow-auto p-4">
						<CheckBox title={m.vim_mode()} bind:value={vimState} />
						<Number
							title={m.execution_timeout()}
							alt={m.execution_timeout_description()}
							bind:value={executionTimeout}
						/>
					</div>
				</TabContent>
			</div>
		</Panel>
	</EditorProvider>
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
