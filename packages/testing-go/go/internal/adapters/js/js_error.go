//go:build js && wasm

package js_adapters

import (
	"errors"
	"syscall/js"
)

var ErrTooFewArguments = errors.New("too few arguments")

var ErrorConstructor = js.Global().Get("Error")

func Error(err error) js.Value {
	return ErrorConstructor.New(err.Error())
}
