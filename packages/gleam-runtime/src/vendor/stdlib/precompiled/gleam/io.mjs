import * as $string from "../gleam/string.mjs";
import {
  print as do_print,
  print_error as do_print_error,
  console_log as do_println,
  console_error as do_println_error,
  print_debug as do_debug_println,
} from "../gleam_stdlib.mjs";

/**
 * Writes a string to standard output.
 *
 * If you want your output to be printed on its own line see `println`.
 *
 * ## Example
 *
 * ```gleam
 * io.print("Hi mum")
 * // -> Nil
 * // Hi mum
 * ```
 */
export function print(string) {
  return do_print(string);
}

/**
 * Writes a string to standard error.
 *
 * If you want your output to be printed on its own line see `println_error`.
 *
 * ## Example
 *
 * ```
 * io.print_error("Hi pop")
 * // -> Nil
 * // Hi pop
 * ```
 */
export function print_error(string) {
  return do_print_error(string);
}

/**
 * Writes a string to standard output, appending a newline to the end.
 *
 * ## Example
 *
 * ```gleam
 * io.println("Hi mum")
 * // -> Nil
 * // Hi mum
 * ```
 */
export function println(string) {
  return do_println(string);
}

/**
 * Writes a string to standard error, appending a newline to the end.
 *
 * ## Example
 *
 * ```gleam
 * io.println_error("Hi pop")
 * // -> Nil
 * // Hi pop
 * ```
 */
export function println_error(string) {
  return do_println_error(string);
}

/**
 * Prints a value to standard error (stderr) yielding Gleam syntax.
 *
 * The value is returned after being printed so it can be used in pipelines.
 *
 * ## Example
 *
 * ```gleam
 * debug("Hi mum")
 * // -> "Hi mum"
 * // <<"Hi mum">>
 * ```
 *
 * ```gleam
 * debug(Ok(1))
 * // -> Ok(1)
 * // {ok, 1}
 * ```
 *
 * ```gleam
 * import gleam/list
 *
 * [1, 2]
 * |> list.map(fn(x) { x + 1 })
 * |> debug
 * |> list.map(fn(x) { x * 2 })
 * // -> [4, 6]
 * // [2, 3]
 * ```
 */
export function debug(term) {
  let _pipe = term;
  let _pipe$1 = $string.inspect(_pipe);
  do_debug_println(_pipe$1)
  return term;
}
