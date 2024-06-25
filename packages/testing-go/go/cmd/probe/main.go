package main

import (
	"github.com/traefik/yaegi/interp"
)

const src = `package foo
func Test() string {
	return "123"
}`

func main() {
	i := interp.New(interp.Options{})

	_, err := i.Eval(src)
	if err != nil {
		panic(err)
	}

	v, err := i.Eval("foo.Test()")
	if err != nil {
		panic(err)
	}
	println(v.Kind().String())
	if str, ok := v.Interface().(string); ok {
		println(str)
	} else {
		panic("not a string")
	}
}
