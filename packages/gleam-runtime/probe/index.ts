const compilerFile = Bun.file(
  new URL("../vendor/compiler/gleam_wasm_bg.wasm", import.meta.url)
);

import { initSync, write_module, initialise_panic_hook, reset_warnings, compile_package, read_compiled_javascript } from "../vendor/compiler/gleam_wasm";
import stdlib from '../vendor/stdlib/stdlib'

initSync(await compilerFile.arrayBuffer());

initialise_panic_hook(false)

const projectId = 1

for (const [name, code] of Object.entries(stdlib)) {
  write_module(projectId, name, code)
}

const code = await Bun.file(new URL("code.gleam", import.meta.url)).text()

write_module(projectId, "main", code)

// old garbage collect projects
  // garbageCollectProjects() {
  //   const gone = [];
  //   for (const [id, project] of this.#projects) {
  //     if (!project.deref()) gone.push(id);
  //   }
  //   for (const id of gone) {
  //     this.#projects.delete(id);
  //     this.#wasm.delete_project(id);
  //   }
  // }

reset_warnings(projectId)

compile_package(projectId, "javascript")

console.log(read_compiled_javascript(projectId, "main"))
