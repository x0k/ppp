{ pkgs-unstable, pkgs }:

pkgs.stdenv.mkDerivation {
  name = "gleam-stdlib";
  src = ./.;

  nativeBuildInputs = [
    pkgs-unstable.gleam
    pkgs.nodejs_24
  ];

  outputHashMode = "recursive";
  outputHashAlgo = "sha256";
  outputHash = "sha256-qWvP8wXf7/NEqqZb4sni0II42WDsuPEyueN2ZAI0yu8=";

  buildPhase = ''
    set -euo pipefail
    export HOME=$(pwd)
    gleam deps download
    gleam build
    gleam run
  '';

  installPhase = ''
    set -euo pipefail
    mkdir -p $out
    cp -r dist/* $out/
  '';
}
