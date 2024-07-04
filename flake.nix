{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    mk.url = "github:x0k/mk";
  };

  outputs =
    {
      self,
      nixpkgs,
      mk,
      fenix,
    }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
      f =
        with fenix.packages.${system};
        combine [
          stable.toolchain
          targets.wasm32-unknown-unknown.stable.rust-std
        ];
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        inherit nixpkgs;
        buildInputs = [
          mk.packages.${system}.default
          pkgs.nodejs
          pkgs.bun
          pkgs.pnpm
          pkgs.go
          pkgs.python3
          pkgs.gcc
          pkgs.curl
          pkgs.libiconv
          pkgs.ninja
          pkgs.cmake
          f
          pkgs.llvmPackages.bintools
          pkgs.wasm-pack
          pkgs.gleam
        ];
        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
          pkgs.stdenv.cc.cc
          pkgs.xz
          pkgs.zlib
        ];
        CARGO_TARGET_WASM32_UNKNOWN_UNKNOWN_LINKER = "lld";
      };
    };
}
