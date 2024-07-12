//go:build js && wasm

package js_adapters

import (
	"context"
	"fmt"
	"syscall/js"

	"github.com/x0k/ppp/internal/lib/logger"
	"github.com/x0k/ppp/internal/lib/logger/sl"
)

const simpleCacheName = "js_adapters.SimpleCache[T]"

type SimpleCacheConfig struct {
	Get *js.Value `js:"get"`
	Add *js.Value `js:"add"`
}

type SimpleCache[T any] struct {
	log    *logger.Logger
	cfg    SimpleCacheConfig
	toJs   func(T) (js.Value, error)
	fromJs func(js.Value) (T, error)
}

func NewSimpleCache[T any](
	log *logger.Logger,
	name string,
	cfg SimpleCacheConfig,
	toJs func(T) (js.Value, error),
	fromJs func(js.Value) (T, error),
) *SimpleCache[T] {
	return &SimpleCache[T]{
		log:    log.With(sl.Component(name)),
		cfg:    cfg,
		fromJs: fromJs,
		toJs:   toJs,
	}
}

func (c *SimpleCache[T]) Get(ctx context.Context) (T, bool) {
	const op = simpleCacheName + ".Get"
	res, err := Await(ctx, c.cfg.Get.Invoke())
	if err != nil {
		c.log.Error(ctx, "failed to get from cache", sl.Op(op), sl.Err(err))
		return *new(T), false
	}
	if res.IsNull() {
		return *new(T), false
	}
	val, err := c.fromJs(res)
	if err != nil {
		c.log.Error(ctx, "failed to parse value from cache", sl.Op(op), sl.Err(err))
		return *new(T), false
	}
	return val, true
}

func (c *SimpleCache[T]) Add(ctx context.Context, value T) error {
	const op = simpleCacheName + ".Add"
	jsValue, err := c.toJs(value)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	if _, err := Await(ctx, c.cfg.Add.Invoke(jsValue)); err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}
