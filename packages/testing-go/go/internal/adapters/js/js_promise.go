//go:build js && wasm

package js_adapters

import (
	"syscall/js"
)

var PromiseConstructor = js.Global().Get("Promise")

type Promise struct {
	promise js.Value
}

func (p Promise) ToJs() js.Value {
	return p.promise
}

func NewPromise(action func() (Result, error)) Promise {
	handler := js.FuncOf(func(this js.Value, args []js.Value) any {
		resolve := args[0]
		go func() {
			result, err := action()
			if err != nil {
				resolve.Invoke(Fail(err).ToJS())
			} else {
				resolve.Invoke(result.ToJS())
			}
		}()
		return nil
	})
	promise := PromiseConstructor.New(handler)
	handler.Release()
	return Promise{promise}
}

func Resolve(data Result) Promise {
	return Promise{
		promise: PromiseConstructor.Call("resolve", data.ToJS()),
	}
}

func ResolveError(err error) Promise {
	return Resolve(Fail(err))
}
