{ pkgs, version }:

pkgs.stdenv.mkDerivation {
  name = "gleam-compiler";

  src = pkgs.fetchurl {
    url = "https://github.com/gleam-lang/gleam/releases/download/v${version}/gleam-v${version}-browser.tar.gz";
    hash = "sha256-WOWmN5TzJwLhyV8oJXiWQcAnA30/f75RZbdeECGUAIY=";
  };

  sourceRoot = ".";

  installPhase = ''
    mkdir -p $out
    cp -t $out gleam_wasm_bg.wasm gleam_wasm_bg.wasm.d.ts gleam_wasm.d.ts \
      gleam_wasm.js package.json README.md LICENCE 2>/dev/null || true
    sed -i '/async function __wbg_init/,/^}/{
        /^async function __wbg_init/!{
            /^}/!d
        }
    }' $out/gleam_wasm.js
  '';
}
