//go:build js && wasm

package js_adapters

import (
	"io"
	"syscall/js"
)

type Writer struct {
	write     js.Value
	bufferLen int
	buffer    js.Value
	zero      js.Value
}

func NewWriter(
	write js.Value,
) *Writer {
	bufferLen := 1024
	return &Writer{
		write:     write,
		bufferLen: bufferLen,
		buffer:    Uint8ArrayConstructor.New(bufferLen),
	}
}

// TODO: This will not work with non-utf8 data
func (w *Writer) Write(p []byte) (int, error) {
	pLen := len(p)
	if pLen > w.bufferLen {
		w.bufferLen = pLen
		w.buffer = Uint8ArrayConstructor.New(w.bufferLen)
	}
	js.CopyBytesToJS(w.buffer, p)
	w.write.Invoke(w.buffer.Call("subarray", 0, pLen))
	return pLen, nil
}

type Reader struct {
	read js.Value
}

func NewReader(
	read js.Value,
) *Reader {
	return &Reader{
		read: read,
	}
}

func (r *Reader) Read(buffer []byte) (int, error) {
	d := r.read.Invoke()
	n := js.CopyBytesToGo(buffer, d)
	var err error
	if n == 0 {
		err = io.EOF
	}
	return n, err
}
