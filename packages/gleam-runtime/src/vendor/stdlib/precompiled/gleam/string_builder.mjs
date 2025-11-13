import { toList, isEqual } from "../gleam.mjs";
import * as $list from "../gleam/list.mjs";
import {
  add as do_append,
  concat as do_from_strings,
  concat as do_concat,
  identity as do_from_string,
  identity as do_to_string,
  length as do_byte_size,
  lowercase as do_lowercase,
  uppercase as do_uppercase,
  graphemes as do_to_graphemes,
  split as do_split,
  string_replace as replace,
} from "../gleam_stdlib.mjs";

export { replace };

/**
 * Prepends some `StringBuilder` onto the start of another.
 *
 * Runs in constant time.
 */
export function prepend_builder(builder, prefix) {
  return do_append(prefix, builder);
}

/**
 * Appends some `StringBuilder` onto the end of another.
 *
 * Runs in constant time.
 */
export function append_builder(builder, suffix) {
  return do_append(builder, suffix);
}

/**
 * Create an empty `StringBuilder`. Useful as the start of a pipe chaining many
 * builders together.
 */
export function new$() {
  return do_from_strings(toList([]));
}

/**
 * Converts a list of strings into a builder.
 *
 * Runs in constant time.
 */
export function from_strings(strings) {
  return do_from_strings(strings);
}

/**
 * Joins a list of builders into a single builder.
 *
 * Runs in constant time.
 */
export function concat(builders) {
  return do_concat(builders);
}

/**
 * Converts a string into a builder.
 *
 * Runs in constant time.
 */
export function from_string(string) {
  return do_from_string(string);
}

/**
 * Prepends a `String` onto the start of some `StringBuilder`.
 *
 * Runs in constant time.
 */
export function prepend(builder, prefix) {
  return append_builder(from_string(prefix), builder);
}

/**
 * Appends a `String` onto the end of some `StringBuilder`.
 *
 * Runs in constant time.
 */
export function append(builder, second) {
  return append_builder(builder, from_string(second));
}

/**
 * Turns an `StringBuilder` into a `String`
 *
 * This function is implemented natively by the virtual machine and is highly
 * optimised.
 */
export function to_string(builder) {
  return do_to_string(builder);
}

/**
 * Returns the size of the `StringBuilder` in bytes.
 */
export function byte_size(builder) {
  return do_byte_size(builder);
}

/**
 * Joins the given builders into a new builder separated with the given string
 */
export function join(builders, sep) {
  let _pipe = builders;
  let _pipe$1 = $list.intersperse(_pipe, from_string(sep));
  return concat(_pipe$1);
}

/**
 * Converts a builder to a new builder where the contents have been
 * lowercased.
 */
export function lowercase(builder) {
  return do_lowercase(builder);
}

/**
 * Converts a builder to a new builder where the contents have been
 * uppercased.
 */
export function uppercase(builder) {
  return do_uppercase(builder);
}

function do_reverse(builder) {
  let _pipe = builder;
  let _pipe$1 = to_string(_pipe);
  let _pipe$2 = do_to_graphemes(_pipe$1);
  let _pipe$3 = $list.reverse(_pipe$2);
  return from_strings(_pipe$3);
}

/**
 * Converts a builder to a new builder with the contents reversed.
 */
export function reverse(builder) {
  return do_reverse(builder);
}

/**
 * Splits a builder on a given pattern into a list of builders.
 */
export function split(iodata, pattern) {
  return do_split(iodata, pattern);
}

/**
 * Compares two builders to determine if they have the same textual content.
 *
 * Comparing two iodata using the `==` operator may return `False` even if they
 * have the same content as they may have been build in different ways, so
 * using this function is often preferred.
 *
 * ## Examples
 *
 * ```gleam
 * from_strings(["a", "b"]) == from_string("ab")
 * // -> False
 * ```
 *
 * ```gleam
 * is_equal(from_strings(["a", "b"]), from_string("ab"))
 * // -> True
 * ```
 */
export function is_equal(a, b) {
  return isEqual(a, b);
}

/**
 * Inspects a builder to determine if it is equivalent to an empty string.
 *
 * ## Examples
 *
 * ```gleam
 * from_string("ok") |> is_empty
 * // -> False
 * ```
 *
 * ```gleam
 * from_string("") |> is_empty
 * // -> True
 * ```
 *
 * ```gleam
 * from_strings([]) |> is_empty
 * // -> True
 * ```
 */
export function is_empty(builder) {
  return isEqual(from_string(""), builder);
}
