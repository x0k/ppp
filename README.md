# Programming Patterns Practice

Web-based platform for solving design-oriented programming challenges.

## Development

Prerequisites:

- [Nix](https://nixos.org/download) with [flakes](https://wiki.nixos.org/wiki/Flakes) enabled
- [pnpm](https://pnpm.io/installation)

Clone the repository:

```
git clone https://github.com/x0k/ppp.git
git submodule update --init
```

Install dependencies and start the dev server:

```
pnpm install
pnpm dev
```

Runtime compiler artifacts are not committed to the repository — they are built from Nix expressions and fetched from the binary cache, then generated into the package source trees at build time (`precheck`/`prebuild` scripts). The first build may take a while to download.

To regenerate the vendored artifacts after modifying a compiler (e.g. `packages/go-runtime/go`), run its script from nix development environment:

```console
nix develop
cd packages/go-runtime && ./artifacts.sh
```

## See also

- Client-side code playground 90+ languages/frameworks - [LiveCodes](https://github.com/live-codes/livecodes)
- Simple build automation tool - [mk](https://github.com/x0k/mk)
