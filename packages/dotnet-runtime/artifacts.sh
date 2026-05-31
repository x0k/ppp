#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)

path=$(nix build "$ROOT#dotnet-compiler" --no-link --print-out-paths)

rm -rf "$ROOT/packages/dotnet-runtime/src/vendor/compiler" "$ROOT/packages/dotnet-runtime/src/vendor/lib"
mkdir -p "$ROOT/packages/dotnet-runtime/src/vendor/compiler" "$ROOT/packages/dotnet-runtime/src/vendor/lib"
cp -r "$path/compiler"/. "$ROOT/packages/dotnet-runtime/src/vendor/compiler"
cp -r "$path/lib"/. "$ROOT/packages/dotnet-runtime/src/vendor/lib"
chmod -R u+w "$ROOT/packages/dotnet-runtime/src/vendor/compiler" "$ROOT/packages/dotnet-runtime/src/vendor/lib"
