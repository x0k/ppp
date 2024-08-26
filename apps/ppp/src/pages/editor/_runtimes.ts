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

interface Runtime {
  initialValue: string;
  compilerFactory: CompilerFactory;
  Description: Component;
}

export const RUNTIMES: Record<Language, Runtime> = {
  [Language.PHP]: {
    initialValue: "PHP",
    compilerFactory: makeRemoteCompilerFactory(PhpWorker),
    Description: DESCRIPTIONS[Language.PHP],
  },
  [Language.TypeScript]: {
    initialValue: "TypeScript",
    compilerFactory: makeRemoteCompilerFactory(TsWorker),
    Description: DESCRIPTIONS[Language.TypeScript],
  },
  [Language.Python]: {
    initialValue: "Python",
    compilerFactory: makeRemoteCompilerFactory(PythonWorker),
    Description: DESCRIPTIONS[Language.Python],
  },
  [Language.JavaScript]: {
    initialValue: "JavaScript",
    compilerFactory: makeRemoteCompilerFactory(JsWorker),
    Description: DESCRIPTIONS[Language.JavaScript],
  },
  [Language.Go]: {
    initialValue: "Go",
    compilerFactory: makeRemoteCompilerFactory(GoWorker),
    Description: DESCRIPTIONS[Language.Go],
  },
  [Language.Rust]: {
    initialValue: "Rust",
    compilerFactory: makeRemoteCompilerFactory(RustWorker),
    Description: DESCRIPTIONS[Language.Rust],
  },
  [Language.Gleam]: {
    initialValue: "Gleam",
    compilerFactory: makeRemoteCompilerFactory(GleamWorker),
    Description: DESCRIPTIONS[Language.Gleam],
  },
  [Language.CSharp]: {
    initialValue: "CSharp",
    compilerFactory: makeDotnetCompiler,
    Description: DESCRIPTIONS[Language.CSharp],
  },
  [Language.Java]: {
    initialValue: "Java",
    compilerFactory: makeRemoteCompilerFactory(JavaWorker),
    Description: DESCRIPTIONS[Language.Java],
  },
};
