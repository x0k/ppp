package compiler

import (
	"context"
	"reflect"

	"github.com/traefik/yaegi/interp"
	"github.com/traefik/yaegi/stdlib"
)

type Compiler struct {
	inter *interp.Interpreter
}

func New() (*Compiler, error) {
	inter := interp.New(interp.Options{
		BuildTags: []string{
			"wasm", "js",
		},
	})
	if err := inter.Use(stdlib.Symbols); err != nil {
		return nil, err
	}
	return &Compiler{
		inter: inter,
	}, nil
}

func (c *Compiler) Compile(ctx context.Context, code string) (*Program, error) {
	_, err := c.inter.EvalWithContext(ctx, code)
	if err != nil {
		return nil, err
	}
	return &Program{
		inter: c.inter,
	}, nil
}

type Program struct {
	inter *interp.Interpreter
}

func (p *Program) Exec(ctx context.Context, code string) (reflect.Value, error) {
	return p.inter.EvalWithContext(ctx, code)
}
