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
        config.allowInsecure = true;
      };
      pkgs-very-old = import (pkgs.fetchFromGitHub {
        owner = "NixOS";
        repo = "nixpkgs";
        rev = "19.09";
        sha256 = "0mhqhq21y5vrr1f30qd2bvydv4bbbslvyzclhw0kdxmkgg3z4c92";
      }) { inherit system; };
      f =
        with fenix.packages.${system};
        combine [
          stable.toolchain
          targets.wasm32-unknown-unknown.stable.rust-std
        ];
      oldGcc = pkgs-very-old.gcc5;
      fhs = pkgs.buildFHSUserEnv {
        name = "llvm-clang-build-env";
        targetPkgs =
          pkgs:
          (with pkgs; [
            time
            oldGcc
            cmake
            ninja
            python27Full
            nodejs
            ncurses
            ncurses.dev
            unzip
            boost
            openssl
            openssl.dev
            glibc
            glibc.dev
            libxml2
            libxml2.dev
            libffi
            libffi.dev
            zlib
            zlib.dev
            libedit
            readline
            readline.dev
          ]);
        profile = ''
          export CC=${oldGcc}/bin/gcc
          export CXX=${oldGcc}/bin/g++
          export LD_LIBRARY_PATH=${
            pkgs.lib.makeLibraryPath [
              oldGcc.cc.lib
              pkgs.glibc
              pkgs.ncurses
              pkgs.readline
              pkgs.openssl
              pkgs.zlib
              pkgs.libxml2
              pkgs.libffi
            ]
          }:$LD_LIBRARY_PATH
          export CPATH=${
            pkgs.lib.makeSearchPathOutput "dev" "include" [
              oldGcc.cc
              pkgs.glibc
              pkgs.ncurses
              pkgs.readline
              pkgs.openssl
              pkgs.zlib
              pkgs.libxml2
              pkgs.libffi
            ]
          }
          export LIBRARY_PATH=$LD_LIBRARY_PATH
          export PATH=${
            pkgs.lib.makeBinPath [
              oldGcc
              pkgs.cmake
              pkgs.ninja
              pkgs.python27Full
              pkgs.nodejs
            ]
          }:$PATH
          export CXXFLAGS="-D_GLIBCXX_USE_CXX11_ABI=0"
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
