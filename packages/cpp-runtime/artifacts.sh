#!/usr/bin/env bash
set -euo pipefail

DIR=$(cd "$(dirname "$0")" && pwd)
VENDOR="$DIR/node_modules/browsercc/dist"

if [ ! -d "$VENDOR" ]; then
	echo "browsercc is not installed. Run pnpm install first." >&2
	exit 1
fi

mkdir -p "$DIR/public/cpp" "$DIR/src/vendor"
cp "$VENDOR/clang.wasm" "$VENDOR/lld.wasm" "$VENDOR/sysroot.tar" "$DIR/public/cpp/"
# The Emscripten glue modules are vendored into src so they are bundled and
# the wasm binaries are provided explicitly (no import.meta.url resolution).
cp "$VENDOR/clang.js" "$VENDOR/lld.js" "$DIR/src/vendor/"
