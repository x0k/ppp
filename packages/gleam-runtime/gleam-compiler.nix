{ pkgs, version }:

pkgs.stdenv.mkDerivation {
  name = "gleam-compiler";

  src = pkgs.fetchurl {
    url = "https://github.com/gleam-lang/gleam/releases/download/v${version}/gleam-v${version}-browser.tar.gz";
    hash = "sha256-WOWmN5TzJwLhyV8oJXiWQcAnA30/f75RZbdeECGUAIY=";
  };

  sourceRoot = ".";

  installPhase = ''
    set -euo pipefail
    mkdir -p $out
    # Copy only the required files; extras (README, LICENCE) may not be present
    for f in gleam_wasm_bg.wasm gleam_wasm_bg.wasm.d.ts gleam_wasm.d.ts gleam_wasm.js package.json; do
      if [ -f "$f" ]; then cp "$f" "$out/"; fi
    done
    # Strip the __wbg_init function body — it contains wasm init logic that we
    # handle separately. This sed is fragile: it will break if the function
    # signature or brace style changes upstream.
    sed -i '/async function __wbg_init/,/^}/{
        /^async function __wbg_init/!{
            /^}/!d
        }
    }' $out/gleam_wasm.js
  '';
}
