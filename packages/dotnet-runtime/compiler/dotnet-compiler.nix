{ pkgs }:

pkgs.stdenv.mkDerivation {
  name = "dotnet-compiler";
  src = ./.;

  nativeBuildInputs = [ pkgs.dotnet-sdk_10 ];

  outputHashMode = "recursive";
  outputHashAlgo = "sha256";
  outputHash = "sha256-JvYyLmuF6Cx6mCgv86ulg8FCGD2v2ngAwsdoHEZZ5no=";

  dontConfigure = true;
  preBuild = ''
    set -euo pipefail
    export HOME=$(pwd)
  '';
  buildPhase = ''
    set -euo pipefail
    dotnet restore compiler.csproj --source https://api.nuget.org/v3/index.json
    dotnet publish compiler.csproj -c Release --no-restore
  '';

  installPhase = ''
    set -euo pipefail
    mkdir -p $out/compiler $out/lib
    cp -r bin/Release/net10.0/wwwroot/_framework/* $out/compiler/
    cp bin/Release/net10.0/*.dll $out/lib/
    # Strip debug symbols, source maps, and locale satellite assemblies
    find $out -name '*.pdb' -delete
    find $out -name '*.js.map' -delete
    find $out/compiler -type d -name '[a-z][a-z]' -prune -exec rm -rf {} +
    find $out/compiler -type d -name '[a-z][a-z]-[A-Z][A-Z]' -prune -exec rm -rf {} +
  '';
}
