//go:build js && wasm

package js_compiler

import (
	"context"
	"errors"
	"syscall/js"

	js_adapters "github.com/x0k/ppp/internal/adapters/js"
	"github.com/x0k/ppp/internal/compiler"
	"github.com/x0k/vert"
)

type JsCompiler struct {
	compiler *compiler.Compiler
}

func New(
	compiler *compiler.Compiler,
) *JsCompiler {
	return &JsCompiler{
		compiler: compiler,
	}
}

func (c *JsCompiler) Compile(ctx context.Context, code string) js_adapters.Result {
	p, err := c.compiler.Compile(ctx, code)
	if err != nil {
		return js_adapters.Err(err)
	}
	exec := js_adapters.Async(func(args []js.Value) js_adapters.Promise {
		if len(args) < 2 {
			return js_adapters.ResolveErr(errors.New("Not enough arguments, expected 2"))
		}
		ctx, cancel := js_adapters.WithAbortSignal(context.Background(), args[0])
		defer cancel()
		v, err := p.Exec(ctx, args[1].String())
		if err != nil {
			return js_adapters.ResolveErr(err)
		}
		return js_adapters.ResolveOk(vert.ValueOf(v.Interface()))
	})
	return js_adapters.Ok(exec.Value)
}
