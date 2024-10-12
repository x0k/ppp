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
      pkgs = import nixpkgs {
        inherit system;
        config = {
          permittedInsecurePackages = [ "python-2.7.18.8" ];
        };
      };
      pkgs-old = import nixpkgs-old {
        inherit system;
        config = {
          permittedInsecurePackages = [ "nodejs-12.22.12" ];
        };
      };
      # pkgs-very-old = import (pkgs.fetchFromGitHub {
      #   owner = "NixOS";
      #   repo = "nixpkgs";
      #   rev = "19.09";
      #   sha256 = "0mhqhq21y5vrr1f30qd2bvydv4bbbslvyzclhw0kdxmkgg3z4c92";
      # }) { inherit system; };
      f =
        with fenix.packages.${system};
        combine [
          stable.toolchain
          targets.wasm32-unknown-unknown.stable.rust-std
        ];
      clangBuild = derivation {
        name = "clang";
        inherit system;
        builder = "${pkgs.bash}/bin/bash";
        src = ./packages/clang-runtime;
        cu = pkgs.coreutils;
        gcc = pkgs.gcc6;
        args = [
          "-c"
          ''
            $cu/bin/mkdir -p $out/lib
            $cu/bin/ls -l $gcc/bin
            $gcc/bin/gcc --version > $out/test
          ''
        ];
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
            f
            pkgs.wasm-pack
            pkgs.gleam
            pkgs.dotnet-sdk_8
          ];
        };
        rust = pkgs.mkShell {
          buildInputs = [
            pkgs.gcc
            pkgs.ninja
            pkgs.cmake
            pkgs.llvmPackages.bintools
            pkgs.libiconv
          ];
          LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
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
        clang = pkgs.mkShell {
          buildInputs = [ clangBuild ];
        };
      };
    };
}
