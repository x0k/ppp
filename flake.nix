{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-25.11";
    nixpkgs-unstable.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    nixpkgs2111.url = "github:NixOS/nixpkgs/nixos-21.11";
    mk.url = "github:x0k/mk";
  };
  outputs =
    {
      self,
      nixpkgs,
      nixpkgs-unstable,
      nixpkgs2111,
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
      pkgs-unstable = import nixpkgs-unstable {
        inherit system;
      };
      pkgs2111 = import nixpkgs2111 {
        inherit system;
        config = {
          permittedInsecurePackages = [ "nodejs-12.22.12" ];
        };
      };

    in
    {
      packages.${system} = {
        go-compiler = import ./packages/go-runtime/go/go-compiler.nix {
          inherit pkgs;
        };
        gleam-compiler = import ./packages/gleam-runtime/gleam-compiler.nix {
          inherit pkgs;
          version = "1.16.0";
        };
        gleam-stdlib = import ./packages/gleam-runtime/gleamstd/gleam-stdlib.nix {
          inherit pkgs pkgs-unstable;
        };
        dotnet-compiler = import ./packages/dotnet-runtime/compiler/dotnet-compiler.nix {
          inherit pkgs;
        };
        zig-compiler = import ./packages/zig-runtime/compiler/zig-compiler.nix {
          inherit pkgs-unstable;
        };
        java-doppio = import ./packages/java-runtime/java-doppio.nix {
          inherit pkgs pkgs2111;
        };
      };

      checks.${system} = builtins.mapAttrs (_name: pkg: pkg) self.packages.${system};

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
            pkgs.zip
            pkgs.curl
            pkgs.nodejs_24
            pkgs.bun
            pkgs.pnpm
            pkgs.go_1_24
            pkgs-unstable.gleam
            pkgs.python315
            pkgs.dotnet-sdk_10
            pkgs-unstable.binaryen
            pkgs-unstable.zig
          ];
          shellHook = ''
            source <(COMPLETE=bash mk)
          '';
        };
        java = pkgs.mkShell {
          buildInputs = [
            pkgs2111.nodejs-12_x
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
