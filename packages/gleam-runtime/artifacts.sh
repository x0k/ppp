#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)

compiler_path=$(nix build "$ROOT#gleam-compiler" --no-link --print-out-paths)
rm -rf "$ROOT/packages/gleam-runtime/src/vendor/compiler"
mkdir -p "$ROOT/packages/gleam-runtime/src/vendor/compiler"
cp -r "$compiler_path"/. "$ROOT/packages/gleam-runtime/src/vendor/compiler"
chmod -R u+w "$ROOT/packages/gleam-runtime/src/vendor/compiler"

stdlib_path=$(nix build "$ROOT#gleam-stdlib" --no-link --print-out-paths)
rm -rf "$ROOT/packages/gleam-runtime/src/vendor/stdlib"
cp -r "$stdlib_path" "$ROOT/packages/gleam-runtime/src/vendor/stdlib"
chmod -R u+w "$ROOT/packages/gleam-runtime/src/vendor/stdlib"
