//go:build js && wasm

package js_adapters

import (
	"syscall/js"
)

var ObjectConstructor = js.Global().Get("Object")
var Console = js.Global().Get("console")
var Uint8ArrayConstructor = js.Global().Get("Uint8Array")
