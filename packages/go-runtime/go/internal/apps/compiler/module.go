//go:build wasm && js

package app_compiler

import (
	"context"
	"errors"
	"syscall/js"

	js_adapters "github.com/x0k/ppp/internal/adapters/js"
	"github.com/x0k/ppp/internal/compiler"
	js_compiler "github.com/x0k/ppp/internal/compiler/js"
	"github.com/x0k/vert"
)

func New(jsConfig js.Value) js_adapters.Result {
	var cfg CompilerConfig
	if err := vert.Assign(jsConfig, &cfg); err != nil {
		return js_adapters.Err(err)
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

	root.Set("createEvaluator", js_adapters.Async(func(args []js.Value) js_adapters.Promise {
		if len(args) < 2 {
			return js_adapters.ResolveErr(errors.New("Not enough arguments, expected 2"))
		}
		ctx, cancel := js_adapters.WithAbortSignal(context.Background(), args[0])
		defer cancel()

		compiler, err := compiler.New(
			js_adapters.NewWriter(*cfg.Stdout.Write),
			js_adapters.NewWriter(*cfg.Stderr.Write),
		)
		if err != nil {
			return js_adapters.ResolveErr(err)
		}
		return js_adapters.Resolve(js_compiler.New(compiler).CreateEvaluator(ctx, args[1].String()))
	}))

	root.Set("createExecuter", js_adapters.Async(func(args []js.Value) js_adapters.Promise {
		if len(args) < 2 {
			return js_adapters.ResolveErr(errors.New("Not enough arguments, expected 2"))
		}
		ctx, cancel := js_adapters.WithAbortSignal(context.Background(), args[0])
		defer cancel()

		compiler, err := compiler.New(
			js_adapters.NewWriter(*cfg.Stdout.Write),
			js_adapters.NewWriter(*cfg.Stderr.Write),
		)
		if err != nil {
			return js_adapters.ResolveErr(err)
		}
		return js_adapters.Resolve(js_compiler.New(compiler).CreateExecuter(ctx, args[1].String()))
	}))

	return js_adapters.Ok(root)
}
