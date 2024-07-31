#!/usr/bin/env bash

set -xe

d:
  pnpm run dev

c:
  pnpm run check

b:
  pnpm run build

p:
  pnpm run preview

artifacts: */artifacts

libs/:
  pushd packages/libs
  b:
    pnpm run build
  popd

testing/:
  pushd packages/testing
  b:
    pnpm run build
  popd

js/:
  pushd packages/javascript-runtime
  b:
    pnpm run build
  popd

ts/:
  pushd packages/typescript-runtime
  b:
    pnpm run build
  popd

php/:
  pushd packages/php-runtime
  b:
    pnpm run build
  popd

python/:
  pushd packages/python-runtime
  b:
    pnpm run build
  popd

go/:
  pushd packages/go-runtime
  p:
    bun run probe/index.ts
  b:
    pnpm run build
  artifacts:
    GOOS=js GOARCH=wasm go build -o ../public/compiler.wasm cmd/compiler/main.go
  probe:
    go run cmd/probe/main.go
  tidy:
    go mod tidy
  popd

rust/:
  pushd packages/rust-runtime
  p:
    bun run probe/index.ts
  b:
    pnpm run build
  artifacts: compiler/*
  compiler/:
    pushd rust
    sdk:
      if [ ! -f wasi-sdk-20.0-linux.tar.gz ]; then
        wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-20/wasi-sdk-20.0-linux.tar.gz
        tar -xzvf wasi-sdk-20.0-linux.tar.gz
      fi
    install:
      LD_LIBRARY_PATH="$NIX_LD_LIBRARY_PATH" ./x.py install
    copy:
      cp dist/bin/miri.wasm ../public
      cp -r dist/lib/rustlib/x86_64-unknown-linux-gnu/lib/* ../public/lib/
    cleanup:
      rm -rf wasi-sdk-20.0* build dist
    popd
  popd

gleam/:
  pushd packages/gleam-runtime
  p:
    bun run probe/index.ts
  b:
    pnpm run build
  artifacts: compiler/* stdlib/*
  compiler/:
    pushd gleam/compiler-wasm
    build:
      CC=clang CXX=clang++ wasm-pack build --release --target web
    copy:
      mkdir -p ../../src/vendor/compiler
      cp -r pkg/* ../../src/vendor/compiler/
    # Remove link to wasm file to prevent
    # Asset embedding by Vite
    refine:
      sed -i '/async function __wbg_init/,/^}/{
          /^async function __wbg_init/!{
              /^}/!d
          }
      }' ../../src/vendor/compiler/gleam_wasm.js
    cleanup:
      rm -rf ../target pkg
    popd
  stdlib/:
    pushd gleamstd
    build:
      gleam run
    copy:
      mkdir -p ../src/vendor/stdlib
      cp -r dist/* ../src/vendor/stdlib/
    cleanup:
      rm -rf dist build
    popd
  popd

dotnet/:
  pushd packages/dotnet-runtime
  b:
    pnpm run build
  artifacts: compiler/build
  workloads:
    workloads=("wasm-tools")
    installed_workloads=$(dotnet workload list | awk 'NR>3 && NF>0 && !/^Use/ {print $1}')
    uninstalled_workloads=()
    for workload in "${workloads[@]}"; do
        if [[ ! $installed_workloads =~ $workload ]] then
            uninstalled_workloads+=("$workload")
        fi
    done
    for workload in "${uninstalled_workloads[@]}"; do
        sudo dotnet workload install "${workload}"
    done
  compiler/: workloads
    build: release copy cleanup
    dev: compile link
    pushd compiler
    compile:
      dotnet build /p:WasmNativeDebugSymbols=true 
    link:
      rm -rf ../src/vendor/compiler
      ln -s $(pwd)/bin/Debug/net8.0/wwwroot/_framework ../src/vendor/compiler
      rm -rf ../src/vendor/lib
      ln -s $(pwd)/bin/Debug/net8.0/ ../src/vendor/lib
    release:
      dotnet publish
    copy:
      rm -rf ../src/vendor/compiler
      rsync -r ./bin/Release/net8.0/publish/wwwroot/_framework/ ../src/vendor/compiler --delete
      rm -rf ../src/vendor/lib
      mkdir -p ../src/vendor/lib
      cp ./bin/Release/net8.0/*.dll ../src/vendor/lib/
    cleanup:
      rm -rf bin obj
    popd
  workloads:
    for workload in "${uninstalled_workloads[@]}"; do
      sudo dotnet workload uninstall "${workload}"
    done
  p:
    pushd probe
    rsync -r ../src/vendor/compiler/ ./compiler/ --delete
    rsync -r ../src/vendor/lib/ ./lib/ --delete
    python server.py
    popd
  popd

java/:
  pushd packages/java-runtime
  b:
    pnpm run build
  artifacts: jvm/*
  jvm/:
    pushd doppio
    build/:
      NIXPKGS_ALLOW_INSECURE=1 nix develop ../../..#java --impure --command bash -xe <<EOF
      install:
        npm install -g grunt-cli yarn
        SKIP_YARN_COREPACK_CHECK=1 yarn install
      release:
        grunt release --force
      EOF
    copy:
      rsync -rL build/release/ ../src/vendor/ --delete
      rm -rf ../src/vendor/classes/test
    cleanup:
      rm -rf build dist node_modules
    popd
  p/:
    pushd probe
    i:
      bun install
    mkdir -p public/doppio
    rsync -rL ../doppio/build/release/ public/doppio --delete
    b:
      bun run build
    p: b
      bun run preview
    bun run dev
    popd
  popd
