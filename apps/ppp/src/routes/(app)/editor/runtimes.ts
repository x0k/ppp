import type { CompilerFactory, Program } from 'libs/compiler';
import { makeRemoteCompilerFactory, type RemoteCompilerFactoryOptions } from 'libs/compiler/actor';

import { Language } from '$lib/language';
import PhpWorker from '$lib/runtime/php/worker?worker';
import TsWorker from '$lib/runtime/ts/worker?worker';
import PythonWorker from '$lib/runtime/python/worker?worker';
import JsWorker from '$lib/runtime/js/worker?worker';
import GoWorker from '$lib/runtime/go/worker?worker';
import RustWorker from '$lib/runtime/rust/worker?worker';
import GleamWorker from '$lib/runtime/gleam/worker?worker';
import JavaWorker from '$lib/runtime/java/worker?worker';
import RubyWorker from '$lib/runtime/ruby/worker?worker';
import DotnetWorker from '$lib/runtime/dotnet/worker?worker';

import phpProgram from './_program.php?raw';
import tsProgram from './_program.ts?raw';
import pythonProgram from './_program.py?raw';
import jsProgram from './_program.js?raw';
import goProgram from './_program.go?raw';
import rustProgram from './_program.rs?raw';
import gleamProgram from './_program.gleam?raw';
import javaProgram from './_program.java?raw';
import csProgram from './_program.cs?raw';
import rubyProgram from './_program.rb?raw';

interface Runtime {
	initialValue: string;
	compilerFactory: CompilerFactory<RemoteCompilerFactoryOptions, Program>;
}

export const RUNTIMES: Record<Language, Runtime> = {
	[Language.JavaScript]: {
		initialValue: jsProgram,
		compilerFactory: makeRemoteCompilerFactory(JsWorker)
	},
	[Language.TypeScript]: {
		initialValue: tsProgram,
		compilerFactory: makeRemoteCompilerFactory(TsWorker)
	},
	[Language.Python]: {
		initialValue: pythonProgram,
		compilerFactory: makeRemoteCompilerFactory(PythonWorker)
	},
	[Language.PHP]: {
		initialValue: phpProgram,
		compilerFactory: makeRemoteCompilerFactory(PhpWorker)
	},
	[Language.Go]: {
		initialValue: goProgram,
		compilerFactory: makeRemoteCompilerFactory(GoWorker)
	},
	[Language.Rust]: {
		initialValue: rustProgram,
		compilerFactory: makeRemoteCompilerFactory(RustWorker)
	},
	[Language.Gleam]: {
		initialValue: gleamProgram,
		compilerFactory: makeRemoteCompilerFactory(GleamWorker)
	},
	[Language.CSharp]: {
		initialValue: csProgram,
		compilerFactory: makeRemoteCompilerFactory(DotnetWorker)
	},
	[Language.Java]: {
		initialValue: javaProgram,
		compilerFactory: makeRemoteCompilerFactory(JavaWorker)
	},
	[Language.Ruby]: {
		initialValue: rubyProgram,
		compilerFactory: makeRemoteCompilerFactory(RubyWorker)
	}
};
