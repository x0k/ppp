/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const initialise_panic_hook: (a: number) => void;
export const delete_project: (a: number) => void;
export const write_module: (a: number, b: number, c: number, d: number, e: number) => void;
export const write_file: (a: number, b: number, c: number, d: number, e: number) => void;
export const write_file_bytes: (a: number, b: number, c: number, d: number, e: number) => void;
export const read_file_bytes: (a: number, b: number, c: number) => [number, number];
export const compile_package: (a: number, b: number, c: number) => [number, number];
export const read_compiled_javascript: (a: number, b: number, c: number) => [number, number];
export const read_compiled_erlang: (a: number, b: number, c: number) => [number, number];
export const pop_warning: (a: number) => [number, number];
export const reset_filesystem: (a: number) => void;
export const reset_warnings: (a: number) => void;
export const ring_core_0_17_13__bn_mul_mont: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_exn_store: (a: number) => void;
export const __externref_table_alloc: () => number;
export const __wbindgen_export_3: WebAssembly.Table;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_start: () => void;
