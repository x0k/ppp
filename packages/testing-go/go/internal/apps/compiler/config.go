//go:build wasm && js

package app_compiler

import "syscall/js"

type LoggerConfig struct {
	Level   int       `js:"level"`
	Console *js.Value `js:"console"`
}

type WriterConfig struct {
	Write *js.Value `js:"write"`
}

type CompilerConfig struct {
	Logger LoggerConfig `js:"logger"`
	Writer WriterConfig `js:"writer"`
}
