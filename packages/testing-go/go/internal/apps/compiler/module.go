//go:build wasm && js

package app_compiler

import (
	"errors"
	"syscall/js"

	js_adapters "github.com/x0k/ppp/internal/adapters/js"
	"github.com/x0k/vert"
)

func New(jsConfig js.Value) js_adapters.Result {
	var cfg CompilerConfig
	if err := vert.Assign(jsConfig, &cfg); err != nil {
		return js_adapters.Fail(err)
	}

	if cfg.Logger.Console == nil || cfg.Logger.Console.IsNull() || cfg.Logger.Console.IsUndefined() {
		cfg.Logger.Console = &js_adapters.Console
	}

	// log := logger.New(
	// 	slog.New(
	// 		js_adapters.NewConsoleLoggerHandler(
	// 			slog.Level(cfg.Logger.Level),
	// 			*cfg.Logger.Console,
	// 		),
	// 	),
	// )

	root := js_adapters.ObjectConstructor.New()

	root.Set("compile", js_adapters.Sync(func(args []js.Value) js_adapters.Result {
		return js_adapters.Fail(errors.New("Not implemented"))
	}))

	return js_adapters.Ok(root)
}
