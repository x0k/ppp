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

type ReaderConfig struct {
	Read *js.Value `js:"read"`
}

type CompilerConfig struct {
	Logger LoggerConfig `js:"logger"`
	Stdin  ReaderConfig `js:"stdin"`
	Stdout WriterConfig `js:"stdout"`
	Stderr WriterConfig `js:"stderr"`
}
