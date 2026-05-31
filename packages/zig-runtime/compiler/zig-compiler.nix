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
  outputHash = "sha256-ZwweQ4lWQS6LY9RPtPPjgOKX+SYTWMctEc4JXTTrcls=";

  buildPhase = ''
    export HOME=$(pwd)
    ZIG_GLOBAL_CACHE_DIR=$HOME/.cache/zig zig build -Drelease
  '';

  installPhase = ''
    mkdir -p $out/zig
    cp -r zig-out/* $out/zig/
  '';
}
