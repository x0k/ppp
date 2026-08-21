{ pkgs }:

pkgs.buildGoModule {
  name = "go-compiler";
  src = builtins.path {
    path = ./.;
    name = "go-compiler-src";
    filter =
      path: type:
      !builtins.elem (baseNameOf path) [
        "result"
        "result-1"
        "result-2"
        ".git"
        "node_modules"
      ];
  };

  vendorHash = "sha256-gzo2GWgCG13smBq9y8t5c8+L3Gyv3xzsOSp7PdjOaYs=";

  buildPhase = ''
    set -euo pipefail
    runHook preBuild
    CGO_ENABLED=0 GOOS=js GOARCH=wasm go build -o $out/compiler.wasm ./cmd/compiler/
    runHook postBuild
  '';

  installPhase = ''
    set -euo pipefail
    runHook preInstall
    mkdir -p $out
    cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" $out/wasm_exec.js
    runHook postInstall
  '';
}
