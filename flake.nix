{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    nixpkgs-old.url = "github:NixOS/nixpkgs/nixos-21.11"; # For Node.js 12
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
      nixpkgs-old,
      mk,
      fenix,
    }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
      pkgs-old = import nixpkgs-old {
        inherit system;
        config.allowInsecure = true;
      };
      f =
        with fenix.packages.${system};
        combine [
          stable.toolchain
          targets.wasm32-unknown-unknown.stable.rust-std
        ];
      fhs = pkgs.buildFHSUserEnv {
        name = "llvm-clang-build-env";
        targetPkgs =
          pkgs: with pkgs-old; [
            gcc
            cmake
            ninja
            python3
            nodejs
            ncurses
            ncurses.dev
            unzip
            boost
            openssl.dev
            glibc
            glibc.dev
            libxml2
            libffi
            zlib
            libedit
          ];
        profile = ''
          export CC=gcc
          export CXX=g++
          export LD_LIBRARY_PATH=/usr/lib:$LD_LIBRARY_PATH
          export hardeningDisable=all
        '';
        runScript = "bash";
      };
    in
    {
      devShells.${system} = {
        default = pkgs.mkShell {
          buildInputs = [
            mk.packages.${system}.default
            pkgs.nodejs
            pkgs.bun
            pkgs.pnpm
            pkgs.go_1_23
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
            pkgs.dotnet-sdk_8
            pkgs.nodePackages.grunt-cli
            pkgs.jdk8
          ];
          NIX_LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
            pkgs.stdenv.cc.cc
            pkgs.xz
            pkgs.zlib
          ];
          CARGO_TARGET_WASM32_UNKNOWN_UNKNOWN_LINKER = "lld";
        };
        java = pkgs.mkShell {
          buildInputs = [
            pkgs-old.nodejs-12_x
            pkgs.jdk8
          ];
          shellHook = ''
            export NPM_CONFIG_PREFIX=~/.npm-global
            export PATH=$NPM_CONFIG_PREFIX/bin:$PATH
          '';
        };
        clang = pkgs.mkShell { buildInputs = [ fhs ]; };
      };
    };
}
