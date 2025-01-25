{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-24.11";
    nixpkgs-old.url = "github:NixOS/nixpkgs/nixos-21.11"; # For Node.js 12
    mk.url = "github:x0k/mk";
  };
  outputs =
    {
      self,
      nixpkgs,
      nixpkgs-old,
      mk,
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
    in
    {
      devShells.${system} = {
        default = pkgs.mkShell {
          # NOTE: this is required for NixOS (configuration.nix)
          # programs.nix-ld.enable = true;
          # programs.nix-ld.libraries = with pkgs; [
          #   libcxx      # Provides libc++.so.1
          #   zlib
          #   openssl
          #   glibc
          # ];
          buildInputs = [
            mk.packages.${system}.default
            pkgs.curl
            pkgs.nodejs
            pkgs.bun
            pkgs.pnpm
            pkgs.go_1_23
            pkgs.gleam
            pkgs.python314
            pkgs.dotnetCorePackages.dotnet_9.sdk
          ];
          shellHook = ''
            source <(COMPLETE=bash mk)
          '';
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
      };
    };
}
