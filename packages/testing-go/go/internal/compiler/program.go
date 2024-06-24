package compiler

import (
	"context"

	"github.com/traefik/yaegi/interp"
)

type Program struct {
	program  *interp.Program
	executor *interp.Interpreter
}

func (p *Program) Exec(ctx context.Context) error {
	_, err := p.executor.ExecuteWithContext(ctx, p.program)
	return err
}
