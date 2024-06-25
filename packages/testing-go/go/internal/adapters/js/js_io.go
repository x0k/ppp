//go:build js && wasm

package js_adapters

import (
	"errors"
	"syscall/js"
)

func NewWriter(
	write js.Value,
) *Writer {
	return &Writer{
		write: write,
	}
}

type Writer struct {
	write js.Value
}

// TODO: This will not work with non-utf8 data
func (w *Writer) Write(p []byte) (n int, err error) {
	str := string(p)
	r := w.write.Invoke(str)
	if r.IsNull() || r.IsUndefined() {
		return len(p), nil
	}
	return 0, errors.New(r.String())
}
