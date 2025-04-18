//go:build wasm && js

package main

import (
	"errors"
	"os"
	"syscall/js"

	js_adapters "github.com/x0k/ppp/internal/adapters/js"
	app_compiler "github.com/x0k/ppp/internal/apps/compiler"
)

func main() {
	// Memory ballast
	_ = make([]byte, 10<<20)

	if len(os.Args) < 2 {
		panic("No init function name provided")
	}

	initFunctionName := os.Args[1]

	// NOTE: We can't use `go:wasmexport` instead because it has restrictions
	// on what types it can receive and return
	// https://go.dev/blog/wasmexport#limitations
	js.Global().Set(initFunctionName, js_adapters.Sync(func(args []js.Value) js_adapters.Result {
		if len(args) < 1 {
			return js_adapters.Err(errors.New("Not enough arguments"))
		}
		return app_compiler.New(args[0])
	}))

	select {}
}
