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
  outputHash = "sha256-vnHks1rbZBH7oaHc5R/kKkG5zRJXPMuqk5bYy7vD6Lk=";

  buildPhase = ''
    set -euo pipefail
    export HOME=$(pwd)
    ZIG_GLOBAL_CACHE_DIR=$HOME/.cache/zig zig build -Drelease
  '';

  installPhase = ''
    set -euo pipefail
    mkdir -p $out/zig

    # Rebuild zig.tar.gz deterministically: `zig build` creates it with
    # wall-clock mtimes and the building user's name embedded.
    tarroot=$(mktemp -d)
    tar -xzf zig-out/zig.tar.gz -C "$tarroot"
    find "$tarroot" -type d -exec chmod 755 {} +
    find "$tarroot" -type f -exec chmod 644 {} +
    find "$tarroot" -exec touch -h -d @1 {} +
    tar --sort=name --numeric-owner --owner=0 --group=0 --mtime=@1 -C "$tarroot" -cf - . | gzip -n > $out/zig/zig.tar.gz
    rm -rf "$tarroot"

    cp -r zig-out/bin zig-out/libcompiler_rt.a $out/zig/

    # Normalize timestamps and permissions so the recursive output hash is stable.
    find $out -type d -exec chmod 755 {} +
    find $out -type f -exec chmod 644 {} +
    find $out -exec touch -h -d @1 {} +
  '';
}
