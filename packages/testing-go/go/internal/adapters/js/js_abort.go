//go:build js && wasm

package js_adapters

import (
	"context"
	"syscall/js"
)

func WithAbortSignal(parentCtx context.Context, signal js.Value) (context.Context, func()) {
	// Cancel should be deferred on the caller side
	ctx, cancel := context.WithCancel(parentCtx)
	callback := js.FuncOf(func(this js.Value, args []js.Value) any {
		cancel()
		return nil
	})
	signal.Call("addEventListener", "abort", callback)
	context.AfterFunc(ctx, func() {
		signal.Call("removeEventListener", "abort", callback)
		callback.Release()
	})
	return ctx, cancel
}
