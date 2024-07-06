# Programming Patterns Practice

## Development

Clone the repository:

```
git clone https://github.com/x0k/ppp.git
git submodule update --init
````

The artifacts saved in the repository must be created in the nix development environment.

Temporarily, docker is required to build the dotnet runtime.

```console
nix develop
mk a/build
```

## See also

- Simple build automation tool [mk](https://github.com/x0k/mk)
