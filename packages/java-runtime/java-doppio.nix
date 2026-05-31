{ pkgs, pkgs2111 }:

pkgs.stdenv.mkDerivation {
  name = "java-doppio";
  src = pkgs.fetchFromGitHub {
    owner = "plasma-umass";
    repo = "doppio";
    rev = "41f41fbae16f23d2791471e150eeb50ad1247eb8";
    hash = "sha256-JWEaQgiWHIrBfOt63PbP4yr4ciknweCfiEipKTw9D1I=";
  };

  nativeBuildInputs = [
    pkgs2111.nodejs-12_x
    pkgs.jdk8
    pkgs.zip
    pkgs.yarn
    pkgs.cacert
  ];

  outputHashMode = "recursive";
  outputHashAlgo = "sha256";
  outputHash = "sha256-jrA9FzgMle6wPjXwVBQYwD5YYzZLRLeqGWqZNg8dMxc=";

  buildPhase = ''
    export HOME=$(pwd)
    export NODE_TLS_REJECT_UNAUTHORIZED=0
    yarn install --frozen-lockfile --ignore-scripts
    patchShebangs node_modules
    node ./node_modules/.bin/grunt release --force --grunt-ignore-compile-errors
  '';

  installPhase = ''
    mkdir -p $out
    cp -rL build/release/. $out/
    rm -rf $out/classes/test $out/*.js* $out/vendor/java_home/lib/ext
    cd $out
    zip -r doppio.zip .
    rm -rf classes vendor
  '';
  dontFixup = true;
}
