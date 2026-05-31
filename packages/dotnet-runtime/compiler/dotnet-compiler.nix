{ pkgs }:

pkgs.stdenv.mkDerivation {
  name = "dotnet-compiler";
  src = ./.;

  nativeBuildInputs = [ pkgs.dotnet-sdk_10 ];

  outputHashMode = "recursive";
  outputHashAlgo = "sha256";
  outputHash = "sha256-bF1SCteXQ+T9f8yjntSU8q8nGWcQCnq64HOTB45NBKA=";

  dontConfigure = true;
  preBuild = ''
    export HOME=$(pwd)
  '';
  buildPhase = ''
    dotnet restore compiler.csproj --source https://api.nuget.org/v3/index.json
    dotnet publish compiler.csproj -c Release --no-restore
  '';

  installPhase = ''
    mkdir -p $out/compiler $out/lib
    cp -r bin/Release/net10.0/wwwroot/_framework/* $out/compiler/
    cp bin/Release/net10.0/*.dll $out/lib/
  '';
}
