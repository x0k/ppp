#!/usr/bin/env bash

set -xe

d:
  pnpm run dev

c:
  pnpm run check $@

b:
  pnpm run build $@

p:
  pnpm run preview

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
  popd

gleam/:
  pushd packages/gleam-runtime
  p:
    bun run probe/index.ts
  b:
    pnpm run build
  popd

dotnet/:
  pushd packages/dotnet-runtime
  b:
    pnpm run build
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
      cp node_modules/@ruby/3.4-wasm-wasi/dist/ruby+stdlib.wasm public/
    bun run index.ts
    popd

zig/:
  pushd packages/zig-runtime
  b:
    pnpm run build
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
