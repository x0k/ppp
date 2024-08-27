package compiler

import (
	"context"
	"errors"
	"io"
	"reflect"

	"github.com/traefik/yaegi/interp"
	"github.com/traefik/yaegi/stdlib"
)

var ErrProgramNotCompiled = errors.New("program not compiled")

type Compiler struct {
	inter *interp.Interpreter
}

func New(
	stdout io.Writer,
	stderr io.Writer,
) (*Compiler, error) {
	inter := interp.New(interp.Options{
		BuildTags: []string{
			"wasm", "js",
		},
		Stdout: stdout,
		Stderr: stderr,
	})
	if err := inter.Use(stdlib.Symbols); err != nil {
		return nil, err
	}
	return &Compiler{
		inter: inter,
	}, nil
}

func (c *Compiler) Compile(_ context.Context, code string) (*Program, error) {
	prog, err := c.inter.Compile(code)
	if err != nil {
		return nil, err
	}
	return &Program{
		inter: c.inter,
		prog:  prog,
	}, nil
}

func (c *Compiler) Prepare(ctx context.Context, code string) (*Program, error) {
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
	prog  *interp.Program
}

func (p *Program) Exec(ctx context.Context) error {
	if p.prog == nil {
		return ErrProgramNotCompiled
	}
	_, err := p.inter.ExecuteWithContext(ctx, p.prog)
	return err
}

func (p *Program) Eval(ctx context.Context, code string) (reflect.Value, error) {
	return p.inter.EvalWithContext(ctx, code)
}
