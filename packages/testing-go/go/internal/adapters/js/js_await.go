//go:build js && wasm

package js_adapters

import (
	"context"
	"errors"
	"syscall/js"
)

// Do not await self maid promise
func Await(ctx context.Context, promise js.Value) (js.Value, error) {
	resChan := make(chan js.Value)
	errChan := make(chan error)
	go func() {
		select {
		case <-ctx.Done():
			errChan <- ctx.Err()
			return
		default:
			onSuccess := js.FuncOf(func(this js.Value, args []js.Value) any {
				resChan <- args[0]
				return nil
			})
			onError := js.FuncOf(func(this js.Value, args []js.Value) any {
				errChan <- errors.New(args[0].Call("toString").String())
				return nil
			})
			var finally js.Func
			finally = js.FuncOf(func(this js.Value, args []js.Value) any {
				onSuccess.Release()
				onError.Release()
				finally.Release()
				return nil
			})
			promise.Call("then", onSuccess, onError).Call("finally", finally)
		}
	}()
	select {
	case <-ctx.Done():
		return js.Undefined(), ctx.Err()
	case err := <-errChan:
		return js.Undefined(), err
	case data := <-resChan:
		return data, nil
	}
}
