import { Ok, Error, prepend as listPrepend, remainderInt, divideInt } from "../gleam.mjs";
import * as $iterator from "../gleam/iterator.mjs";
import * as $list from "../gleam/list.mjs";
import * as $option from "../gleam/option.mjs";
import { None, Some } from "../gleam/option.mjs";
import * as $order from "../gleam/order.mjs";
import * as $string_builder from "../gleam/string_builder.mjs";
import {
  string_length as do_length,
  lowercase as do_lowercase,
  uppercase as do_uppercase,
  less_than,
  crop_string as crop,
  contains_string as contains,
  starts_with as do_starts_with,
  ends_with as do_ends_with,
  split_once as do_split_once,
  join as do_join,
  trim as do_trim,
  trim_left as do_trim_left,
  trim_right as do_trim_right,
  pop_grapheme as do_pop_grapheme,
  graphemes as to_graphemes,
  codepoint as unsafe_int_to_utf_codepoint,
  string_to_codepoint_integer_list,
  utf_codepoint_list_to_string as from_utf_codepoints,
  utf_codepoint_to_int as do_utf_codepoint_to_int,
  inspect as do_inspect,
  byte_size,
} from "../gleam_stdlib.mjs";

export { byte_size, contains, crop, from_utf_codepoints, to_graphemes };

/**
 * Determines if a `String` is empty.
 *
 * ## Examples
 *
 * ```gleam
 * is_empty("")
 * // -> True
 * ```
 *
 * ```gleam
 * is_empty("the world")
 * // -> False
 * ```
 */
export function is_empty(str) {
  return str === "";
}

/**
 * Gets the number of grapheme clusters in a given `String`.
 *
 * This function has to iterate across the whole string to count the number of
 * graphemes, so it runs in linear time.
 *
 * ## Examples
 *
 * ```gleam
 * length("Gleam")
 * // -> 5
 * ```
 *
 * ```gleam
 * length("ß↑e̊")
 * // -> 3
 * ```
 *
 * ```gleam
 * length("")
 * // -> 0
 * ```
 */
export function length(string) {
  return do_length(string);
}

/**
 * Creates a new `String` by replacing all occurrences of a given substring.
 *
 * ## Examples
 *
 * ```gleam
 * replace("www.example.com", each: ".", with: "-")
 * // -> "www-example-com"
 * ```
 *
 * ```gleam
 * replace("a,b,c,d,e", each: ",", with: "/")
 * // -> "a/b/c/d/e"
 * ```
 */
export function replace(string, pattern, substitute) {
  let _pipe = string;
  let _pipe$1 = $string_builder.from_string(_pipe);
  let _pipe$2 = $string_builder.replace(_pipe$1, pattern, substitute);
  return $string_builder.to_string(_pipe$2);
}

/**
 * Creates a new `String` with all the graphemes in the input `String` converted to
 * lowercase.
 *
 * Useful for case-insensitive comparisons.
 *
 * ## Examples
 *
 * ```gleam
 * lowercase("X-FILES")
 * // -> "x-files"
 * ```
 */
export function lowercase(string) {
  return do_lowercase(string);
}

/**
 * Creates a new `String` with all the graphemes in the input `String` converted to
 * uppercase.
 *
 * Useful for case-insensitive comparisons and VIRTUAL YELLING.
 *
 * ## Examples
 *
 * ```gleam
 * uppercase("skinner")
 * // -> "SKINNER"
 * ```
 */
export function uppercase(string) {
  return do_uppercase(string);
}

/**
 * Compares two `String`s to see which is "larger" by comparing their graphemes.
 *
 * This does not compare the size or length of the given `String`s.
 *
 * ## Examples
 *
 * ```gleam
 * compare("Anthony", "Anthony")
 * // -> order.Eq
 * ```
 *
 * ```gleam
 * compare("A", "B")
 * // -> order.Lt
 * ```
 */
export function compare(a, b) {
  let $ = a === b;
  if ($) {
    return new $order.Eq();
  } else {
    let $1 = less_than(a, b);
    if ($1) {
      return new $order.Lt();
    } else {
      return new $order.Gt();
    }
  }
}

/**
 * Checks whether the first `String` starts with the second one.
 *
 * ## Examples
 *
 * ```gleam
 * starts_with("theory", "ory")
 * // -> False
 * ```
 */
export function starts_with(string, prefix) {
  return do_starts_with(string, prefix);
}

/**
 * Checks whether the first `String` ends with the second one.
 *
 * ## Examples
 *
 * ```gleam
 * ends_with("theory", "ory")
 * // -> True
 * ```
 */
export function ends_with(string, suffix) {
  return do_ends_with(string, suffix);
}

/**
 * Splits a `String` a single time on the given substring.
 *
 * Returns an `Error` if substring not present.
 *
 * ## Examples
 *
 * ```gleam
 * split_once("home/gleam/desktop/", on: "/")
 * // -> Ok(#("home", "gleam/desktop/"))
 * ```
 *
 * ```gleam
 * split_once("home/gleam/desktop/", on: "?")
 * // -> Error(Nil)
 * ```
 */
export function split_once(x, substring) {
  return do_split_once(x, substring);
}

/**
 * Creates a new `String` by joining two `String`s together.
 *
 * This function copies both `String`s and runs in linear time. If you find
 * yourself joining `String`s frequently consider using the [`string_builder`](../gleam/string_builder.html)
 * module as it can append `String`s much faster!
 *
 * ## Examples
 *
 * ```gleam
 * append(to: "butter", suffix: "fly")
 * // -> "butterfly"
 * ```
 */
export function append(first, second) {
  let _pipe = first;
  let _pipe$1 = $string_builder.from_string(_pipe);
  let _pipe$2 = $string_builder.append(_pipe$1, second);
  return $string_builder.to_string(_pipe$2);
}

/**
 * Creates a new `String` by joining many `String`s together.
 *
 * This function copies both `String`s and runs in linear time. If you find
 * yourself joining `String`s frequently consider using the [`string_builder`](../gleam/string_builder.html)
 * module as it can append `String`s much faster!
 *
 * ## Examples
 *
 * ```gleam
 * concat(["never", "the", "less"])
 * // -> "nevertheless"
 * ```
 */
export function concat(strings) {
  let _pipe = strings;
  let _pipe$1 = $string_builder.from_strings(_pipe);
  return $string_builder.to_string(_pipe$1);
}

/**
 * Creates a new `String` by repeating a `String` a given number of times.
 *
 * This function runs in linear time.
 *
 * ## Examples
 *
 * ```gleam
 * repeat("ha", times: 3)
 * // -> "hahaha"
 * ```
 */
export function repeat(string, times) {
  let _pipe = $iterator.repeat(string);
  let _pipe$1 = $iterator.take(_pipe, times);
  let _pipe$2 = $iterator.to_list(_pipe$1);
  return concat(_pipe$2);
}

/**
 * Joins many `String`s together with a given separator.
 *
 * This function runs in linear time.
 *
 * ## Examples
 *
 * ```gleam
 * join(["home","evan","Desktop"], with: "/")
 * // -> "home/evan/Desktop"
 * ```
 */
export function join(strings, separator) {
  return do_join(strings, separator);
}

/**
 * Removes whitespace on both sides of a `String`.
 *
 * ## Examples
 *
 * ```gleam
 * trim("  hats  \n")
 * // -> "hats"
 * ```
 */
export function trim(string) {
  return do_trim(string);
}

/**
 * Removes whitespace on the left of a `String`.
 *
 * ## Examples
 *
 * ```gleam
 * trim_left("  hats  \n")
 * // -> "hats  \n"
 * ```
 */
export function trim_left(string) {
  return do_trim_left(string);
}

/**
 * Removes whitespace on the right of a `String`.
 *
 * ## Examples
 *
 * ```gleam
 * trim_right("  hats  \n")
 * // -> "  hats"
 * ```
 */
export function trim_right(string) {
  return do_trim_right(string);
}

/**
 * Splits a non-empty `String` into its first element (head) and rest (tail).
 * This lets you pattern match on `String`s exactly as you would with lists.
 *
 * Note on JavaScript using the function to iterate over a string will likely
 * be slower than using `to_graphemes` due to string slicing being more
 * expensive on JavaScript than Erlang.
 *
 * ## Examples
 *
 * ```gleam
 * pop_grapheme("gleam")
 * // -> Ok(#("g", "leam"))
 * ```
 *
 * ```gleam
 * pop_grapheme("")
 * // -> Error(Nil)
 * ```
 */
export function pop_grapheme(string) {
  return do_pop_grapheme(string);
}

function do_to_graphemes(loop$string, loop$acc) {
  while (true) {
    let string = loop$string;
    let acc = loop$acc;
    let $ = pop_grapheme(string);
    if ($ instanceof Ok) {
      let grapheme = $[0][0];
      let rest = $[0][1];
      loop$string = rest;
      loop$acc = listPrepend(grapheme, acc);
    } else {
      return acc;
    }
  }
}

function do_reverse(string) {
  let _pipe = string;
  let _pipe$1 = to_graphemes(_pipe);
  let _pipe$2 = $list.reverse(_pipe$1);
  return concat(_pipe$2);
}

/**
 * Reverses a `String`.
 *
 * This function has to iterate across the whole `String` so it runs in linear
 * time.
 *
 * ## Examples
 *
 * ```gleam
 * reverse("stressed")
 * // -> "desserts"
 * ```
 */
export function reverse(string) {
  return do_reverse(string);
}

function do_slice(string, idx, len) {
  let _pipe = string;
  let _pipe$1 = to_graphemes(_pipe);
  let _pipe$2 = $list.drop(_pipe$1, idx);
  let _pipe$3 = $list.take(_pipe$2, len);
  return concat(_pipe$3);
}

/**
 * Takes a substring given a start grapheme index and a length. Negative indexes
 * are taken starting from the *end* of the list.
 *
 * ## Examples
 *
 * ```gleam
 * slice(from: "gleam", at_index: 1, length: 2)
 * // -> "le"
 * ```
 *
 * ```gleam
 * slice(from: "gleam", at_index: 1, length: 10)
 * // -> "leam"
 * ```
 *
 * ```gleam
 * slice(from: "gleam", at_index: 10, length: 3)
 * // -> ""
 * ```
 *
 * ```gleam
 * slice(from: "gleam", at_index: -2, length: 2)
 * // -> "am"
 * ```
 *
 * ```gleam
 * slice(from: "gleam", at_index: -12, length: 2)
 * // -> ""
 * ```
 */
export function slice(string, idx, len) {
  let $ = len < 0;
  if ($) {
    return "";
  } else {
    let $1 = idx < 0;
    if ($1) {
      let translated_idx = length(string) + idx;
      let $2 = translated_idx < 0;
      if ($2) {
        return "";
      } else {
        return do_slice(string, translated_idx, len);
      }
    } else {
      return do_slice(string, idx, len);
    }
  }
}

/**
 * Drops *n* graphemes from the left side of a `String`.
 *
 * ## Examples
 *
 * ```gleam
 * drop_left(from: "The Lone Gunmen", up_to: 2)
 * // -> "e Lone Gunmen"
 * ```
 */
export function drop_left(string, num_graphemes) {
  let $ = num_graphemes < 0;
  if ($) {
    return string;
  } else {
    return slice(string, num_graphemes, length(string) - num_graphemes);
  }
}

/**
 * Drops *n* graphemes from the right side of a `String`.
 *
 * ## Examples
 *
 * ```gleam
 * drop_right(from: "Cigarette Smoking Man", up_to: 2)
 * // -> "Cigarette Smoking M"
 * ```
 */
export function drop_right(string, num_graphemes) {
  let $ = num_graphemes < 0;
  if ($) {
    return string;
  } else {
    return slice(string, 0, length(string) - num_graphemes);
  }
}

/**
 * Creates a list of `String`s by splitting a given string on a given substring.
 *
 * ## Examples
 *
 * ```gleam
 * split("home/gleam/desktop/", on: "/")
 * // -> ["home", "gleam", "desktop", ""]
 * ```
 */
export function split(x, substring) {
  if (substring === "") {
    return to_graphemes(x);
  } else {
    let _pipe = x;
    let _pipe$1 = $string_builder.from_string(_pipe);
    let _pipe$2 = $string_builder.split(_pipe$1, substring);
    return $list.map(_pipe$2, $string_builder.to_string);
  }
}

function padding(size, pad_string) {
  let pad_length = length(pad_string);
  let num_pads = divideInt(size, pad_length);
  let extra = remainderInt(size, pad_length);
  let _pipe = $iterator.repeat(pad_string);
  let _pipe$1 = $iterator.take(_pipe, num_pads);
  return $iterator.append(
    _pipe$1,
    $iterator.single(slice(pad_string, 0, extra)),
  );
}

/**
 * Pads a `String` on the left until it has at least given number of graphemes.
 *
 * ## Examples
 *
 * ```gleam
 * pad_left("121", to: 5, with: ".")
 * // -> "..121"
 * ```
 *
 * ```gleam
 * pad_left("121", to: 3, with: ".")
 * // -> "121"
 * ```
 *
 * ```gleam
 * pad_left("121", to: 2, with: ".")
 * // -> "121"
 * ```
 */
export function pad_left(string, desired_length, pad_string) {
  let current_length = length(string);
  let to_pad_length = desired_length - current_length;
  let _pipe = padding(to_pad_length, pad_string);
  let _pipe$1 = $iterator.append(_pipe, $iterator.single(string));
  let _pipe$2 = $iterator.to_list(_pipe$1);
  return concat(_pipe$2);
}

/**
 * Pads a `String` on the right until it has a given length.
 *
 * ## Examples
 *
 * ```gleam
 * pad_right("123", to: 5, with: ".")
 * // -> "123.."
 * ```
 *
 * ```gleam
 * pad_right("123", to: 3, with: ".")
 * // -> "123"
 * ```
 *
 * ```gleam
 * pad_right("123", to: 2, with: ".")
 * // -> "123"
 * ```
 */
export function pad_right(string, desired_length, pad_string) {
  let current_length = length(string);
  let to_pad_length = desired_length - current_length;
  let _pipe = $iterator.single(string);
  let _pipe$1 = $iterator.append(_pipe, padding(to_pad_length, pad_string));
  let _pipe$2 = $iterator.to_list(_pipe$1);
  return concat(_pipe$2);
}

function do_to_utf_codepoints(string) {
  let _pipe = string;
  let _pipe$1 = string_to_codepoint_integer_list(_pipe);
  return $list.map(_pipe$1, unsafe_int_to_utf_codepoint);
}

/**
 * Converts a `String` to a `List` of `UtfCodepoint`.
 *
 * See <https://en.wikipedia.org/wiki/Code_point> and
 * <https://en.wikipedia.org/wiki/Unicode#Codespace_and_Code_Points> for an
 * explanation on code points.
 *
 * ## Examples
 *
 * ```gleam
 * "a" |> to_utf_codepoints
 * // -> [UtfCodepoint(97)]
 * ```
 *
 * ```gleam
 * // Semantically the same as:
 * // ["🏳", "️", "‍", "🌈"] or:
 * // [waving_white_flag, variant_selector_16, zero_width_joiner, rainbow]
 * "🏳️‍🌈" |> to_utf_codepoints
 * // -> [
 * //   UtfCodepoint(127987),
 * //   UtfCodepoint(65039),
 * //   UtfCodepoint(8205),
 * //   UtfCodepoint(127752),
 * // ]
 * ```
 */
export function to_utf_codepoints(string) {
  return do_to_utf_codepoints(string);
}

/**
 * Converts an integer to a `UtfCodepoint`.
 *
 * Returns an `Error` if the integer does not represent a valid UTF codepoint.
 */
export function utf_codepoint(value) {
  let i = value;
  if (i > 1_114_111) {
    return new Error(undefined);
  } else if (value === 65_534) {
    return new Error(undefined);
  } else if (value === 65_535) {
    return new Error(undefined);
  } else {
    let i$1 = value;
    if ((i$1 >= 55_296) && (i$1 <= 57_343)) {
      return new Error(undefined);
    } else {
      let i$2 = value;
      return new Ok(unsafe_int_to_utf_codepoint(i$2));
    }
  }
}

/**
 * Converts an UtfCodepoint to its ordinal code point value.
 *
 * ## Examples
 *
 * ```gleam
 * let assert [utf_codepoint, ..] = to_utf_codepoints("💜")
 * utf_codepoint_to_int(utf_codepoint)
 * // -> 128156
 * ```
 */
export function utf_codepoint_to_int(cp) {
  return do_utf_codepoint_to_int(cp);
}

/**
 * Converts a `String` into `Option(String)` where an empty `String` becomes
 * `None`.
 *
 * ## Examples
 *
 * ```gleam
 * to_option("")
 * // -> None
 * ```
 *
 * ```gleam
 * to_option("hats")
 * // -> Some("hats")
 * ```
 */
export function to_option(s) {
  if (s === "") {
    return new None();
  } else {
    return new Some(s);
  }
}

/**
 * Returns the first grapheme cluster in a given `String` and wraps it in a
 * `Result(String, Nil)`. If the `String` is empty, it returns `Error(Nil)`.
 * Otherwise, it returns `Ok(String)`.
 *
 * ## Examples
 *
 * ```gleam
 * first("")
 * // -> Error(Nil)
 * ```
 *
 * ```gleam
 * first("icecream")
 * // -> Ok("i")
 * ```
 */
export function first(s) {
  let $ = pop_grapheme(s);
  if ($ instanceof Ok) {
    let first$1 = $[0][0];
    return new Ok(first$1);
  } else {
    return $;
  }
}

/**
 * Returns the last grapheme cluster in a given `String` and wraps it in a
 * `Result(String, Nil)`. If the `String` is empty, it returns `Error(Nil)`.
 * Otherwise, it returns `Ok(String)`.
 *
 * ## Examples
 *
 * ```gleam
 * last("")
 * // -> Error(Nil)
 * ```
 *
 * ```gleam
 * last("icecream")
 * // -> Ok("m")
 * ```
 */
export function last(s) {
  let $ = pop_grapheme(s);
  if ($ instanceof Ok) {
    let $1 = $[0][1];
    if ($1 === "") {
      let first$1 = $[0][0];
      return new Ok(first$1);
    } else {
      let rest = $1;
      return new Ok(slice(rest, -1, 1));
    }
  } else {
    return $;
  }
}

/**
 * Creates a new `String` with the first grapheme in the input `String`
 * converted to uppercase and the remaining graphemes to lowercase.
 *
 * ## Examples
 *
 * ```gleam
 * capitalise("mamouna")
 * // -> "Mamouna"
 * ```
 */
export function capitalise(s) {
  let $ = pop_grapheme(s);
  if ($ instanceof Ok) {
    let first$1 = $[0][0];
    let rest = $[0][1];
    return append(uppercase(first$1), lowercase(rest));
  } else {
    return "";
  }
}

/**
 * Returns a `String` representation of a term in Gleam syntax.
 */
export function inspect(term) {
  let _pipe = do_inspect(term);
  return $string_builder.to_string(_pipe);
}
