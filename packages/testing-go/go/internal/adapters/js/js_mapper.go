//go:build js && wasm

package js_adapters

import (
	"syscall/js"

	"github.com/x0k/vert"
)

func To[T any, R any](mapper func(v T) (R, error)) func(v T) (js.Value, error) {
	return func(v T) (js.Value, error) {
		mapped, err := mapper(v)
		if err != nil {
			return js.Undefined(), err
		}
		return vert.ValueOf(mapped), nil
	}
}

func From[DTO any, R any](mapper func(dto DTO) (R, error)) func(js.Value) (R, error) {
	return func(v js.Value) (R, error) {
		var dto DTO
		if err := vert.Assign(v, &dto); err != nil {
			return *new(R), err
		}
		return mapper(dto)
	}
}
