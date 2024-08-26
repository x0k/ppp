import type { Component } from "svelte";
import type { CompilerFactory } from "compiler";
import { makeRemoteCompilerFactory } from "compiler/actor";

import { Language } from "@/shared/languages";
import PhpWorker from "@/adapters/runtime/php/worker?worker";
import TsWorker from "@/adapters/runtime/ts/worker?worker";
import PythonWorker from "@/adapters/runtime/python/worker?worker";
import JsWorker from "@/adapters/runtime/js/worker?worker";
import GoWorker from "@/adapters/runtime/go/worker?worker";
import RustWorker from "@/adapters/runtime/rust/worker?worker";
import GleamWorker from "@/adapters/runtime/gleam/worker?worker";
import JavaWorker from "@/adapters/runtime/java/worker?worker";
import { makeDotnetCompiler } from '@/adapters/runtime/dotnet/compiler-factory'
import { DESCRIPTIONS } from "@/adapters/runtime/descriptions";

import phpProgram from './_program.php?raw';
import tsProgram from './_program.ts?raw';
import pythonProgram from './_program.py?raw';
import jsProgram from './_program.js?raw';
import goProgram from './_program.go?raw';
import rustProgram from './_program.rs?raw';
import gleamProgram from './_program.gleam?raw';
import javaProgram from './_program.java?raw';
import csProgram from './_program.cs?raw';

interface Runtime {
  initialValue: string;
  compilerFactory: CompilerFactory;
  Description: Component;
}

export const RUNTIMES: Record<Language, Runtime> = {
  [Language.PHP]: {
    initialValue: phpProgram,
    compilerFactory: makeRemoteCompilerFactory(PhpWorker),
    Description: DESCRIPTIONS[Language.PHP],
  },
  [Language.TypeScript]: {
    initialValue: tsProgram,
    compilerFactory: makeRemoteCompilerFactory(TsWorker),
    Description: DESCRIPTIONS[Language.TypeScript],
  },
  [Language.Python]: {
    initialValue: pythonProgram,
    compilerFactory: makeRemoteCompilerFactory(PythonWorker),
    Description: DESCRIPTIONS[Language.Python],
  },
  [Language.JavaScript]: {
    initialValue: jsProgram,
    compilerFactory: makeRemoteCompilerFactory(JsWorker),
    Description: DESCRIPTIONS[Language.JavaScript],
  },
  [Language.Go]: {
    initialValue: goProgram,
    compilerFactory: makeRemoteCompilerFactory(GoWorker),
    Description: DESCRIPTIONS[Language.Go],
  },
  [Language.Rust]: {
    initialValue: rustProgram,
    compilerFactory: makeRemoteCompilerFactory(RustWorker),
    Description: DESCRIPTIONS[Language.Rust],
  },
  [Language.Gleam]: {
    initialValue: gleamProgram,
    compilerFactory: makeRemoteCompilerFactory(GleamWorker),
    Description: DESCRIPTIONS[Language.Gleam],
  },
  [Language.CSharp]: {
    initialValue: csProgram,
    compilerFactory: makeDotnetCompiler,
    Description: DESCRIPTIONS[Language.CSharp],
  },
  [Language.Java]: {
    initialValue: javaProgram,
    compilerFactory: makeRemoteCompilerFactory(JavaWorker),
    Description: DESCRIPTIONS[Language.Java],
  },
};
