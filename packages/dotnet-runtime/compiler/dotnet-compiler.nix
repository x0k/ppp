{ pkgs }:

pkgs.stdenv.mkDerivation {
  name = "dotnet-compiler";
  src = ./.;

  nativeBuildInputs = [ pkgs.dotnet-sdk_10 ];

  outputHashMode = "recursive";
  outputHashAlgo = "sha256";
  outputHash = "sha256-UFR5yFD5oYmayQJKQXxoE7/p2M/j1td+QaxIibBLtT8=";

  dontConfigure = true;
  dontStrip = true;
  preBuild = ''
    set -euo pipefail
    export HOME=$(pwd)
  '';
  buildPhase = ''
    set -euo pipefail
    dotnet restore compiler.csproj --source https://api.nuget.org/v3/index.json
    # Skip pdbs and satellite assemblies so the boot manifest embedded in
    # dotnet.js only references files that actually exist.
    dotnet publish compiler.csproj -c Release --no-restore \
      -p:DebugType=none -p:DebugSymbols=false -p:SatelliteResourceLanguages=en
  '';

  installPhase = ''
    set -euo pipefail
    mkdir -p $out/compiler $out/lib
    cp -r bin/Release/net10.0/wwwroot/_framework/* $out/compiler/
    cp bin/Release/net10.0/*.dll $out/lib/
    find $out -name '*.js.map' -delete
  '';
}
