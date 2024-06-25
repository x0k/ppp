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

func New() (*JsCompiler, error) {
	c, err := compiler.New()
	if err != nil {
		return nil, err
	}
	return &JsCompiler{
		compiler: c,
	}, nil
}

func (c *JsCompiler) Compile(ctx context.Context, code string) js_adapters.Result {
	p, err := c.compiler.Compile(ctx, code)
	if err != nil {
		return js_adapters.Fail(err)
	}
	exec := js_adapters.Sync(func(args []js.Value) js_adapters.Result {
		if len(args) < 2 {
			return js_adapters.Fail(errors.New("Not enough arguments, expected 2"))
		}
		ctx, cancel := js_adapters.WithAbortSignal(context.Background(), args[0])
		defer cancel()
		v, err := p.Exec(ctx, args[1].String())
		if err != nil {
			return js_adapters.Fail(err)
		}
		return js_adapters.Ok(vert.ValueOf(v.Interface()))
	})
	return js_adapters.Ok(exec.Value)
}
