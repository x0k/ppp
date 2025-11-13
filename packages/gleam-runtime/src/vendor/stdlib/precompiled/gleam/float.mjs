import { Ok, Error, Empty as $Empty, divideFloat } from "../gleam.mjs";
import * as $order from "../gleam/order.mjs";
import {
  parse_float as do_parse,
  float_to_string as do_to_string,
  ceiling as do_ceiling,
  floor as do_floor,
  round as js_round,
  truncate as do_truncate,
  power as do_power,
  random_uniform as random,
} from "../gleam_stdlib.mjs";

export { random };

/**
 * Attempts to parse a string as a `Float`, returning `Error(Nil)` if it was
 * not possible.
 *
 * ## Examples
 *
 * ```gleam
 * parse("2.3")
 * // -> Ok(2.3)
 * ```
 *
 * ```gleam
 * parse("ABC")
 * // -> Error(Nil)
 * ```
 */
export function parse(string) {
  return do_parse(string);
}

/**
 * Returns the string representation of the provided `Float`.
 *
 * ## Examples
 *
 * ```gleam
 * to_string(2.3)
 * // -> "2.3"
 * ```
 */
export function to_string(x) {
  return do_to_string(x);
}

/**
 * Compares two `Float`s, returning an `Order`:
 * `Lt` for lower than, `Eq` for equals, or `Gt` for greater than.
 *
 * ## Examples
 *
 * ```gleam
 * compare(2.0, 2.3)
 * // -> Lt
 * ```
 *
 * To handle
 * [Floating Point Imprecision](https://en.wikipedia.org/wiki/Floating-point_arithmetic#Accuracy_problems)
 * you may use [`loosely_compare`](#loosely_compare) instead.
 */
export function compare(a, b) {
  let $ = a === b;
  if ($) {
    return new $order.Eq();
  } else {
    let $1 = a < b;
    if ($1) {
      return new $order.Lt();
    } else {
      return new $order.Gt();
    }
  }
}

/**
 * Compares two `Float`s, returning the smaller of the two.
 *
 * ## Examples
 *
 * ```gleam
 * min(2.0, 2.3)
 * // -> 2.0
 * ```
 */
export function min(a, b) {
  let $ = a < b;
  if ($) {
    return a;
  } else {
    return b;
  }
}

/**
 * Compares two `Float`s, returning the larger of the two.
 *
 * ## Examples
 *
 * ```gleam
 * max(2.0, 2.3)
 * // -> 2.3
 * ```
 */
export function max(a, b) {
  let $ = a > b;
  if ($) {
    return a;
  } else {
    return b;
  }
}

/**
 * Restricts a `Float` between a lower and upper bound.
 *
 * ## Examples
 *
 * ```gleam
 * clamp(1.2, min: 1.4, max: 1.6)
 * // -> 1.4
 * ```
 */
export function clamp(x, min_bound, max_bound) {
  let _pipe = x;
  let _pipe$1 = min(_pipe, max_bound);
  return max(_pipe$1, min_bound);
}

/**
 * Rounds the value to the next highest whole number as a `Float`.
 *
 * ## Examples
 *
 * ```gleam
 * ceiling(2.3)
 * // -> 3.0
 * ```
 */
export function ceiling(x) {
  return do_ceiling(x);
}

/**
 * Rounds the value to the next lowest whole number as a `Float`.
 *
 * ## Examples
 *
 * ```gleam
 * floor(2.3)
 * // -> 2.0
 * ```
 */
export function floor(x) {
  return do_floor(x);
}

/**
 * Returns the value as an `Int`, truncating all decimal digits.
 *
 * ## Examples
 *
 * ```gleam
 * truncate(2.4343434847383438)
 * // -> 2
 * ```
 */
export function truncate(x) {
  return do_truncate(x);
}

/**
 * Returns the absolute value of the input as a `Float`.
 *
 * ## Examples
 *
 * ```gleam
 * absolute_value(-12.5)
 * // -> 12.5
 * ```
 *
 * ```gleam
 * absolute_value(10.2)
 * // -> 10.2
 * ```
 */
export function absolute_value(x) {
  let $ = x >= 0.0;
  if ($) {
    return x;
  } else {
    return 0.0 - x;
  }
}

/**
 * Compares two `Float`s within a tolerance, returning an `Order`:
 * `Lt` for lower than, `Eq` for equals, or `Gt` for greater than.
 *
 * This function allows Float comparison while handling
 * [Floating Point Imprecision](https://en.wikipedia.org/wiki/Floating-point_arithmetic#Accuracy_problems).
 *
 * Notice: For `Float`s the tolerance won't be exact:
 * `5.3 - 5.0` is not exactly `0.3`.
 *
 * ## Examples
 *
 * ```gleam
 * loosely_compare(5.0, with: 5.3, tolerating: 0.5)
 * // -> Eq
 * ```
 *
 * If you want to check only for equality you may use
 * [`loosely_equals`](#loosely_equals) instead.
 */
export function loosely_compare(a, b, tolerance) {
  let difference = absolute_value(a - b);
  let $ = difference <= tolerance;
  if ($) {
    return new $order.Eq();
  } else {
    return compare(a, b);
  }
}

/**
 * Checks for equality of two `Float`s within a tolerance,
 * returning an `Bool`.
 *
 * This function allows Float comparison while handling
 * [Floating Point Imprecision](https://en.wikipedia.org/wiki/Floating-point_arithmetic#Accuracy_problems).
 *
 * Notice: For `Float`s the tolerance won't be exact:
 * `5.3 - 5.0` is not exactly `0.3`.
 *
 * ## Examples
 *
 * ```gleam
 * loosely_equals(5.0, with: 5.3, tolerating: 0.5)
 * // -> True
 * ```
 *
 * ```gleam
 * loosely_equals(5.0, with: 5.1, tolerating: 0.1)
 * // -> False
 * ```
 */
export function loosely_equals(a, b, tolerance) {
  let difference = absolute_value(a - b);
  return difference <= tolerance;
}

/**
 * Returns the results of the base being raised to the power of the
 * exponent, as a `Float`.
 *
 * ## Examples
 *
 * ```gleam
 * power(2.0, -1.0)
 * // -> Ok(0.5)
 * ```
 *
 * ```gleam
 * power(2.0, 2.0)
 * // -> Ok(4.0)
 * ```
 *
 * ```gleam
 * power(8.0, 1.5)
 * // -> Ok(22.627416997969522)
 * ```
 *
 * ```gleam
 * 4.0 |> power(of: 2.0)
 * // -> Ok(16.0)
 * ```
 *
 * ```gleam
 * power(-1.0, 0.5)
 * // -> Error(Nil)
 * ```
 */
export function power(base, exponent) {
  let fractional = (ceiling(exponent) - exponent) > 0.0;
  let $ = ((base < 0.0) && fractional) || ((base === 0.0) && (exponent < 0.0));
  if ($) {
    return new Error(undefined);
  } else {
    return new Ok(do_power(base, exponent));
  }
}

/**
 * Returns the square root of the input as a `Float`.
 *
 * ## Examples
 *
 * ```gleam
 * square_root(4.0)
 * // -> Ok(2.0)
 * ```
 *
 * ```gleam
 * square_root(-16.0)
 * // -> Error(Nil)
 * ```
 */
export function square_root(x) {
  return power(x, 0.5);
}

/**
 * Returns the negative of the value provided.
 *
 * ## Examples
 *
 * ```gleam
 * negate(1.0)
 * // -> -1.0
 * ```
 */
export function negate(x) {
  return -1.0 * x;
}

function do_round(x) {
  let $ = x >= 0.0;
  if ($) {
    return js_round(x);
  } else {
    return 0 - js_round(negate(x));
  }
}

/**
 * Rounds the value to the nearest whole number as an `Int`.
 *
 * ## Examples
 *
 * ```gleam
 * round(2.3)
 * // -> 2
 * ```
 *
 * ```gleam
 * round(2.5)
 * // -> 3
 * ```
 */
export function round(x) {
  return do_round(x);
}

function do_sum(loop$numbers, loop$initial) {
  while (true) {
    let numbers = loop$numbers;
    let initial = loop$initial;
    if (numbers instanceof $Empty) {
      return initial;
    } else {
      let x = numbers.head;
      let rest = numbers.tail;
      loop$numbers = rest;
      loop$initial = x + initial;
    }
  }
}

/**
 * Sums a list of `Float`s.
 *
 * ## Example
 *
 * ```gleam
 * sum([1.0, 2.2, 3.3])
 * // -> 6.5
 * ```
 */
export function sum(numbers) {
  let _pipe = numbers;
  return do_sum(_pipe, 0.0);
}

function do_product(loop$numbers, loop$initial) {
  while (true) {
    let numbers = loop$numbers;
    let initial = loop$initial;
    if (numbers instanceof $Empty) {
      return initial;
    } else {
      let x = numbers.head;
      let rest = numbers.tail;
      loop$numbers = rest;
      loop$initial = x * initial;
    }
  }
}

/**
 * Multiplies a list of `Float`s and returns the product.
 *
 * ## Example
 *
 * ```gleam
 * product([2.5, 3.2, 4.2])
 * // -> 33.6
 * ```
 */
export function product(numbers) {
  if (numbers instanceof $Empty) {
    return 1.0;
  } else {
    return do_product(numbers, 1.0);
  }
}

/**
 * Returns division of the inputs as a `Result`.
 *
 * ## Examples
 *
 * ```gleam
 * divide(0.0, 1.0)
 * // -> Ok(1.0)
 * ```
 *
 * ```gleam
 * divide(1.0, 0.0)
 * // -> Error(Nil)
 * ```
 */
export function divide(a, b) {
  if (b === 0.0) {
    return new Error(undefined);
  } else {
    let b$1 = b;
    return new Ok(divideFloat(a, b$1));
  }
}

/**
 * Adds two floats together.
 *
 * It's the function equivalent of the `+.` operator.
 * This function is useful in higher order functions or pipes.
 *
 * ## Examples
 *
 * ```gleam
 * add(1.0, 2.0)
 * // -> 3.0
 * ```
 *
 * ```gleam
 * import gleam/list
 *
 * list.fold([1.0, 2.0, 3.0], 0.0, add)
 * // -> 6.0
 * ```
 *
 * ```gleam
 * 3.0 |> add(2.0)
 * // -> 5.0
 * ```
 */
export function add(a, b) {
  return a + b;
}

/**
 * Multiplies two floats together.
 *
 * It's the function equivalent of the `*.` operator.
 * This function is useful in higher order functions or pipes.
 *
 * ## Examples
 *
 * ```gleam
 * multiply(2.0, 4.0)
 * // -> 8.0
 * ```
 *
 * ```gleam
 * import gleam/list
 *
 * list.fold([2.0, 3.0, 4.0], 1.0, multiply)
 * // -> 24.0
 * ```
 *
 * ```gleam
 * 3.0 |> multiply(2.0)
 * // -> 6.0
 * ```
 */
export function multiply(a, b) {
  return a * b;
}

/**
 * Subtracts one float from another.
 *
 * It's the function equivalent of the `-.` operator.
 * This function is useful in higher order functions or pipes.
 *
 * ## Examples
 *
 * ```gleam
 * subtract(3.0, 1.0)
 * // -> 2.0
 * ```
 *
 * ```gleam
 * import gleam/list
 *
 * list.fold([1.0, 2.0, 3.0], 10.0, subtract)
 * // -> 4.0
 * ```
 *
 * ```gleam
 * 3.0 |> subtract(_, 2.0)
 * // -> 1.0
 * ```
 *
 * ```gleam
 * 3.0 |> subtract(2.0, _)
 * // -> -1.0
 * ```
 */
export function subtract(a, b) {
  return a - b;
}
