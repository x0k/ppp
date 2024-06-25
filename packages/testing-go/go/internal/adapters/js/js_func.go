//go:build js && wasm

package js_adapters

import "syscall/js"

func Sync(
	fn func(args []js.Value) Result,
) js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) any {
		result := fn(args)
		return result.ToJS()
	})
}

func Async(
	fn func(args []js.Value) Promise,
) js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) any {
		result := fn(args)
		return result.ToJs()
	})
}
