#!/usr/bin/env bash

set -e

make -C src/mono/wasm provision-wasm
export EMSDK_PATH=$PWD/src/mono/wasm/emsdk
./build.sh mono+libs -os browser -c Release
