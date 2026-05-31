#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)

path=$(nix build "$ROOT#zig-compiler" --no-link --print-out-paths)

rm -rf "$ROOT/packages/zig-runtime/public/zig"
mkdir -p "$ROOT/packages/zig-runtime/public/zig"
cp -r "$path/zig"/. "$ROOT/packages/zig-runtime/public/zig"
chmod -R u+w "$ROOT/packages/zig-runtime/public/zig"
