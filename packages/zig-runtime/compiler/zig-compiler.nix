{ pkgs-unstable }:

pkgs-unstable.stdenv.mkDerivation {
  name = "zig-compiler";
  src = ./.;

  nativeBuildInputs = [
    pkgs-unstable.zig
    pkgs-unstable.binaryen
  ];

  outputHashMode = "recursive";
  outputHashAlgo = "sha256";
  outputHash = "sha256-Q2VMKWv2FaWIF1otr+7gtwFCHcROjwlBqwHdbh4xVMs=";

  buildPhase = ''
    set -euo pipefail
    export HOME=$(pwd)
    ZIG_GLOBAL_CACHE_DIR=$HOME/.cache/zig zig build -Drelease
  '';

  installPhase = ''
    set -euo pipefail
    mkdir -p $out/zig
    cp -r zig-out/* $out/zig/
  '';
}
