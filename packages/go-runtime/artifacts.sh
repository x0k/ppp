#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)

path=$(nix build "$ROOT#go-compiler" --no-link --print-out-paths)

rm -f "$ROOT/packages/go-runtime/public/compiler.wasm"
rm -f "$ROOT/packages/go-runtime/src/vendor/wasm_exec.js"
mkdir -p "$ROOT/packages/go-runtime/public" "$ROOT/packages/go-runtime/src/vendor"
cp "$path/compiler.wasm" "$ROOT/packages/go-runtime/public/compiler.wasm"
cp "$path/wasm_exec.js" "$ROOT/packages/go-runtime/src/vendor/wasm_exec.js"
