import { dotnet } from "./compiler/dotnet.js";

const { setModuleImports, getAssemblyExports, getConfig } = await dotnet
  .withDiagnosticTracing(false)
  .withApplicationArguments()
  .create();

setModuleImports("main.js", {
  logger: {
    debug: (msg) => console.log(msg),
    info: (msg) => console.info(msg),
    warn: (msg) => console.warn(msg),
    error: (msg) => console.error(msg),
  },
});

const config = getConfig();
const exports = await getAssemblyExports(config.mainAssemblyName);

console.log(exports);

console.log(
  "Compiled",
  exports.Compiler.Compile(`using System;

Console.WriteLine("Hello World");
`)
);
