#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)

path=$(nix build "$ROOT#java-doppio" --no-link --print-out-paths)

rm -f "$ROOT/packages/java-runtime/src/vendor/doppio.zip"
mkdir -p "$ROOT/packages/java-runtime/src/vendor"
cp "$path/doppio.zip" "$ROOT/packages/java-runtime/src/vendor/doppio.zip"
