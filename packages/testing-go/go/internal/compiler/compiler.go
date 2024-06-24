package compiler

import (
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

func (c *Compiler) Compile(code string) (*Program, error) {
	program, err := c.inter.Compile(code)
	if err != nil {
		return nil, err
	}
	return &Program{
		program:  program,
		executor: c.inter,
	}, nil
}
