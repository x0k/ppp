//go:build js && wasm

package js_adapters

import (
	"context"
	"fmt"
	"syscall/js"

	"github.com/x0k/ppp/internal/lib/logger"
	"github.com/x0k/ppp/internal/lib/logger/sl"
)

const keyedCacheName = "js_adapters.KeyedCache[T]"

type KeyedCacheConfig struct {
	Get *js.Value `js:"get"`
	Add *js.Value `js:"add"`
}

type KeyedCache[K comparable, T any] struct {
	log         *logger.Logger
	cfg         KeyedCacheConfig
	keyToJs     func(K) (js.Value, error)
	valueToJs   func(T) (js.Value, error)
	valueFromJs func(js.Value) (T, error)
}

func NewKeyedCache[K comparable, T any](
	log *logger.Logger,
	name string,
	cfg KeyedCacheConfig,
	keyToJs func(K) (js.Value, error),
	valueToJs func(T) (js.Value, error),
	valueFromJs func(js.Value) (T, error),
) *KeyedCache[K, T] {
	return &KeyedCache[K, T]{
		log:         log.With(sl.Component(name)),
		cfg:         cfg,
		keyToJs:     keyToJs,
		valueFromJs: valueFromJs,
		valueToJs:   valueToJs,
	}
}

func (c *KeyedCache[K, T]) Get(ctx context.Context, query K) (T, bool) {
	const op = keyedCacheName + ".Get"
	jsQuery, err := c.keyToJs(query)
	if err != nil {
		c.log.Error(ctx, "failed to convert query to js", sl.Op(op), sl.Err(err))
		return *new(T), false
	}
	res, err := Await(ctx, c.cfg.Get.Invoke(jsQuery))
	if err != nil {
		c.log.Error(ctx, "failed to get from cache", sl.Op(op), sl.Err(err))
		return *new(T), false
	}
	if res.IsNull() {
		return *new(T), false
	}
	val, err := c.valueFromJs(res)
	if err != nil {
		c.log.Error(ctx, "failed to parse value from cache", sl.Op(op), sl.Err(err))
		return *new(T), false
	}
	return val, true
}

func (c *KeyedCache[K, T]) Add(ctx context.Context, query K, value T) error {
	const op = keyedCacheName + ".Add"
	jsQuery, err := c.keyToJs(query)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	jsValue, err := c.valueToJs(value)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	if _, err := Await(ctx, c.cfg.Add.Invoke(jsQuery, jsValue)); err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}
