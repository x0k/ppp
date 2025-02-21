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

ppp/:
  pushd apps/ppp
  c:
    pnpm run check
  d:
    pnpm run dev
  b:
    pnpm run build
  p:
    pnpm run preview
  popd

artifacts: */artifacts

libs/:
  pushd packages/libs
  b:
    pnpm run build
  t:
    pnpm run test
  popd

compiler/:
  pushd packages/compiler
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
  update-wasm-exec:
    cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" src/vendor
  artifacts: compiler/build
  compiler/:
    pushd go
    build:
      GOOS=js GOARCH=wasm go build -o ../public/compiler.wasm cmd/compiler/main.go
    probe:
      go run cmd/probe/main.go
    tidy:
      go mod tidy
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
    version="v1.7.0"
    name="gleam-${version}-browser"
    download:
      if [ ! -f "${name}.tar.gz" ]; then
        curl -L -C - -O "https://github.com/gleam-lang/gleam/releases/download/${version}/${name}.tar.gz"
        mkdir -p "${name}"
        tar -xzvf "${name}.tar.gz" --directory "${name}"
      fi
    copy:
      mkdir -p src/vendor/compiler
      cp -r $name/* src/vendor/compiler/
    # Remove link to wasm file to prevent
    # Asset embedding by Vite
    refine:
      sed -i '/async function __wbg_init/,/^}/{
          /^async function __wbg_init/!{
              /^}/!d
          }
      }' src/vendor/compiler/gleam_wasm.js    
    cleanup:
      rm -rf ${name}*
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
    workloads=("wasm-experimental" "wasm-tools")
    installed_workloads=$(dotnet workload list | awk 'NR>3 && NF>0 && !/^Use/ {print $1}')
    uninstalled_workloads=()
    for workload in "${workloads[@]}"; do
        if [[ ! $installed_workloads =~ $workload ]] then
            uninstalled_workloads+=("$workload")
        fi
    done
    for workload in "${uninstalled_workloads[@]}"; do
        dotnet workload install "${workload}"
    done
  compiler/: workloads
    build: release copy cleanup
      TARGET=Release
    dev: compile link
      TARGET=Debug
    pushd compiler
    compile:
      dotnet build /p:WasmNativeDebugSymbols=true
    release:
      dotnet publish
    link:
      rm -rf ../src/vendor/compiler
      ln -s $(pwd)/bin/${TARGET}/net9.0/wwwroot/_framework ../src/vendor/compiler
      rm -rf ../src/vendor/lib
      ln -s $(pwd)/bin/${TARGET}/net9.0/ ../src/vendor/lib
    copy:
      rm -rf ../src/vendor/compiler
      rsync -r ./bin/${TARGET}/net9.0/wwwroot/_framework/ ../src/vendor/compiler --delete
      rm -rf ../src/vendor/lib
      mkdir -p ../src/vendor/lib
      cp ./bin/${TARGET}/net9.0/*.dll ../src/vendor/lib/
    cleanup:
      rm -rf bin obj
    popd
  # workloads:
  #   for workload in "${uninstalled_workloads[@]}"; do
  #     dotnet workload uninstall "${workload}"
  #   done
  p:
    pushd probe
    rsync -r ../src/vendor/compiler/ ./compiler/ --delete
    rsync -r ../src/vendor/lib/ ./lib/ --delete
    python server.py
    popd
  popd

ruby/:
  pushd packages/ruby-runtime
  b:
    pnpm run build
  p/:
    pushd probe
    i:
      bun install
      cp node_modules/@ruby/3.3-wasm-wasi/dist/ruby+stdlib.wasm public/
    bun run index.ts
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
        curl -L -C - -O https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-20/wasi-sdk-20.0-linux.tar.gz
        tar -xzvf wasi-sdk-20.0-linux.tar.gz
      fi
    install:
      nix develop ../../..#rust --command bash -xe -c "./x.py install"
    copy:
      cp dist/bin/miri.wasm ../public
      cp -r dist/lib/rustlib/x86_64-unknown-linux-gnu/lib/* ../public/lib/
    cleanup:
      rm -rf wasi-sdk-20.0* build dist
    popd
  popd

java/:
  pushd packages/java-runtime
  b:
    pnpm run build
  c:
    pnpm run check
  artifacts: jvm/*
  jvm/:
    pushd doppio
    build/:
      nix develop ../../..#java --command bash -xe <<EOF
      install:
        npm install -g grunt-cli yarn
        SKIP_YARN_COREPACK_CHECK=1 yarn install
      release:
        grunt release --force
      cli:
        grunt release-cli
      EOF
    copy:
      rsync -rL build/release/ ../src/vendor/ --delete
      rm -rf ../src/vendor/classes/test ../src/vendor/*.js* \
        ../src/vendor/vendor/java_home/lib/ext
    compress:
      pushd ../src/vendor
      zip -r doppio.zip *
      rm -rf classes vendor
      popd
    cleanup:
      rm -rf build dist node_modules
    popd
  p/:
    pushd probe
    i:
      bun install
    s:
      cp ../src/vendor/doppio.zip public
    b:
      bun run build
    p:
      bun run preview
    bun run dev
    popd
  popd