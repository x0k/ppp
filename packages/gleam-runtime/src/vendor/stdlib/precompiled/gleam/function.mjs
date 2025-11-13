export function compose(fun1, fun2) {
  return (a) => { return fun2(fun1(a)); };
}

/**
 * Takes a function with `2` arguments (an arity of `2`), and returns the
 * curried equivalent.
 *
 * `fn(a, b) -> c` becomes `fn(a) -> fn(b) -> c`.
 *
 * ## Examples
 *
 * *Currying* creates a new function that is identical to the given function
 * except that arguments must now be supplied one by one over several function
 * calls. It thus is the process of taking a function with `n` arguments
 * and producing a sequence of `n` single-argument functions. Given:
 *
 * ```gleam
 * fn my_fun(i: Int, s: String) -> String { ... }
 * ```
 *
 * …calling `curry2(my_fun)` would return the curried equivalent, like so:
 *
 * ```gleam
 * curry2(my_fun)
 * // fn(Int) -> fn(String) -> String
 * ```
 *
 * Currying is useful when you want to partially apply a function with
 * some arguments and then pass it somewhere else, for example:
 *
 * ```gleam
 * import gleam/list
 *
 * let multiply = curry2(fn(x, y) { x * y })
 * list.map([1, 2, 3], multiply(2))
 * // -> [2, 4, 6]
 * ```
 */
export function curry2(fun) {
  return (a) => { return (b) => { return fun(a, b); }; };
}

/**
 * Takes a function with `3` arguments (an arity of `3`), and returns the
 * curried equivalent.
 *
 * `fn(a, b, c) -> d` becomes `fn(a) -> fn(b) -> fn(c) -> d`.
 *
 * See [`curry2`](#curry2) for a detailed explanation.
 */
export function curry3(fun) {
  return (a) => { return (b) => { return (c) => { return fun(a, b, c); }; }; };
}

/**
 * Takes a function with `4` arguments (an arity of `4`), and returns the
 * curried equivalent.
 *
 * `fn(a, b, c, d) -> e` becomes `fn(a) -> fn(b) -> fn(c) -> fn(d) -> e`.
 *
 * See [`curry2`](#curry2) for a detailed explanation.
 */
export function curry4(fun) {
  return (a) => {
    return (b) => {
      return (c) => { return (d) => { return fun(a, b, c, d); }; };
    };
  };
}

/**
 * Takes a function with `5` arguments (an arity of `5`), and returns the
 * curried equivalent.
 *
 * `fn(a, b, c, d, e) -> f` becomes
 * `fn(a) -> fn(b) -> fn(c) -> fn(d) -> fn(e) -> f`.
 *
 * See [`curry2`](#curry2) for a detailed explanation.
 */
export function curry5(fun) {
  return (a) => {
    return (b) => {
      return (c) => {
        return (d) => { return (e) => { return fun(a, b, c, d, e); }; };
      };
    };
  };
}

/**
 * Takes a function with `6` arguments (an arity of `6`), and returns the
 * curried equivalent.
 *
 * `fn(a, b, c, d, e, f) -> g` becomes
 * `fn(a) -> fn(b) -> fn(c) -> fn(d) -> fn(e) -> fn(f) -> g`.
 *
 * See [`curry2`](#curry2) for a detailed explanation.
 */
export function curry6(fun) {
  return (a) => {
    return (b) => {
      return (c) => {
        return (d) => {
          return (e) => { return (f) => { return fun(a, b, c, d, e, f); }; };
        };
      };
    };
  };
}

/**
 * Takes a function that takes two arguments and returns a new function that
 * takes the same two arguments, but in reverse order.
 */
export function flip(fun) {
  return (b, a) => { return fun(a, b); };
}

/**
 * Takes a single argument and always returns its input value.
 */
export function identity(x) {
  return x;
}

export function constant(value) {
  return (_) => { return value; };
}

/**
 * Takes an argument and a single function,
 * calls that function with that argument
 * and returns that argument instead of the function return value.
 * Useful for running synchronous side effects in a pipeline.
 */
export function tap(arg, effect) {
  effect(arg);
  return arg;
}

/**
 * Takes a function with arity one and an argument,
 * calls that function with the argument and returns the function return value.
 *
 * Useful for concisely calling functions returned as a part of a pipeline.
 *
 * ## Example
 *
 * ```gleam
 * let doubler = fn() {
 *   fn(x: Int) { x * 2 }
 * }
 *
 * doubler() |> apply1(2)
 * // -> 4
 * ```
 */
export function apply1(fun, arg1) {
  return fun(arg1);
}

/**
 * Takes a function with arity two and two arguments,
 * calls that function with the arguments
 * and returns the function return value.
 *
 * See [`apply1`](#apply1) for more details.
 */
export function apply2(fun, arg1, arg2) {
  return fun(arg1, arg2);
}

/**
 * Takes a function with arity three and three arguments,
 * calls that function with the arguments
 * and returns the function return value.
 *
 * See [`apply1`](#apply1) for more details.
 */
export function apply3(fun, arg1, arg2, arg3) {
  return fun(arg1, arg2, arg3);
}
