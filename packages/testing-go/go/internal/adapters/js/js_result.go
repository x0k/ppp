//go:build js && wasm

package js_adapters

import "syscall/js"

type Result struct {
	ok    bool
	value js.Value
	error js.Value
}

func (r Result) ToJS() js.Value {
	obj := ObjectConstructor.New()
	obj.Set("ok", r.ok)
	if r.ok {
		obj.Set("value", r.value)
	} else {
		obj.Set("error", r.error)
	}
	return obj
}

func Ok(value js.Value) Result {
	return Result{
		ok:    true,
		value: value,
	}
}

func Fail(err error) Result {
	return Result{
		ok:    false,
		error: js.ValueOf(err.Error()),
	}
}
