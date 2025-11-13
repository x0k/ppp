import { Ok, toList } from "../gleam.mjs";
import * as $string from "../gleam/string.mjs";
import {
  bit_array_from_string as from_string,
  length as byte_size,
  bit_array_slice as slice,
  bit_array_to_string as do_to_string,
  bit_array_concat as concat,
  encode64,
  decode64,
  base16_encode,
  base16_decode,
  bit_array_inspect as inspect,
} from "../gleam_stdlib.mjs";

export {
  base16_decode,
  base16_encode,
  byte_size,
  concat,
  from_string,
  inspect,
  slice,
};

/**
 * Converts a bit array to a string.
 *
 * Returns an error if the bit array is invalid UTF-8 data.
 */
export function to_string(bits) {
  return do_to_string(bits);
}

function do_is_utf8(bits) {
  let $ = to_string(bits);
  if ($ instanceof Ok) {
    return true;
  } else {
    return false;
  }
}

/**
 * Tests to see whether a bit array is valid UTF-8.
 */
export function is_utf8(bits) {
  return do_is_utf8(bits);
}

/**
 * Creates a new bit array by joining two bit arrays.
 *
 * ## Examples
 *
 * ```gleam
 * append(to: from_string("butter"), suffix: from_string("fly"))
 * // -> from_string("butterfly")
 * ```
 */
export function append(first, second) {
  return concat(toList([first, second]));
}

/**
 * Encodes a BitArray into a base 64 encoded string.
 */
export function base64_encode(input, padding) {
  let encoded = encode64(input);
  if (padding) {
    return encoded;
  } else {
    return $string.replace(encoded, "=", "");
  }
}

/**
 * Decodes a base 64 encoded string into a `BitArray`.
 */
export function base64_decode(encoded) {
  let _block;
  let $ = byte_size(from_string(encoded)) % 4;
  if ($ === 0) {
    _block = encoded;
  } else {
    let n = $;
    _block = $string.append(encoded, $string.repeat("=", 4 - n));
  }
  let padded = _block;
  return decode64(padded);
}

/**
 * Encodes a `BitArray` into a base 64 encoded string with URL and filename safe alphabet.
 */
export function base64_url_encode(input, padding) {
  let _pipe = base64_encode(input, padding);
  let _pipe$1 = $string.replace(_pipe, "+", "-");
  return $string.replace(_pipe$1, "/", "_");
}

/**
 * Decodes a base 64 encoded string with URL and filename safe alphabet into a `BitArray`.
 */
export function base64_url_decode(encoded) {
  let _pipe = encoded;
  let _pipe$1 = $string.replace(_pipe, "-", "+");
  let _pipe$2 = $string.replace(_pipe$1, "_", "/");
  return base64_decode(_pipe$2);
}
