{ pkgs }:

pkgs.buildGoModule {
  name = "go-compiler";
  src = ./.;

  vendorHash = "sha256-gzo2GWgCG13smBq9y8t5c8+L3Gyv3xzsOSp7PdjOaYs=";

  buildPhase = ''
    runHook preBuild
    CGO_ENABLED=0 GOOS=js GOARCH=wasm go build -o $out/compiler.wasm ./cmd/compiler/
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" $out/wasm_exec.js
    runHook postInstall
  '';
}
