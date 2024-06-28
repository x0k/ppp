{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    mk.url = "github:x0k/mk";
  };

  outputs =
    {
      self,
      nixpkgs,
      mk,
    }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        inherit nixpkgs;
        buildInputs = [
          mk.packages.${system}.default
          pkgs.nodejs
          pkgs.pnpm
          pkgs.go
          pkgs.python3
        ];
      };
    };
}
