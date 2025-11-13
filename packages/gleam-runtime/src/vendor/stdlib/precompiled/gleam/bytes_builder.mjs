import {
  toList,
  Empty as $Empty,
  prepend as listPrepend,
  CustomType as $CustomType,
} from "../gleam.mjs";
import * as $bit_array from "../gleam/bit_array.mjs";
import * as $list from "../gleam/list.mjs";
import * as $string_builder from "../gleam/string_builder.mjs";

class Bytes extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}

class Text extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}

class Many extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}

/**
 * Appends a builder onto the end of another.
 *
 * Runs in constant time.
 */
export function append_builder(first, second) {
  if (second instanceof Many) {
    let builders = second[0];
    return new Many(listPrepend(first, builders));
  } else {
    return new Many(toList([first, second]));
  }
}

/**
 * Prepends a builder onto the start of another.
 *
 * Runs in constant time.
 */
export function prepend_builder(second, first) {
  return append_builder(first, second);
}

/**
 * Joins a list of builders into a single builder.
 *
 * Runs in constant time.
 */
export function concat(builders) {
  return new Many(builders);
}

/**
 * Create an empty `BytesBuilder`. Useful as the start of a pipe chaining many
 * builders together.
 */
export function new$() {
  return concat(toList([]));
}

/**
 * Creates a new builder from a string.
 *
 * Runs in constant time when running on Erlang.
 * Runs in linear time otherwise.
 */
export function from_string(string) {
  return new Text($string_builder.from_string(string));
}

/**
 * Prepends a string onto the start of a builder.
 *
 * Runs in constant time when running on Erlang.
 * Runs in linear time with the length of the string otherwise.
 */
export function prepend_string(second, first) {
  return append_builder(from_string(first), second);
}

/**
 * Appends a string onto the end of a builder.
 *
 * Runs in constant time when running on Erlang.
 * Runs in linear time with the length of the string otherwise.
 */
export function append_string(first, second) {
  return append_builder(first, from_string(second));
}

/**
 * Creates a new builder from a string builder.
 *
 * Runs in constant time when running on Erlang.
 * Runs in linear time otherwise.
 */
export function from_string_builder(builder) {
  return new Text(builder);
}

/**
 * Creates a new builder from a bit array.
 *
 * Runs in constant time.
 */
export function from_bit_array(bits) {
  return new Bytes(bits);
}

/**
 * Prepends a bit array to the start of a builder.
 *
 * Runs in constant time.
 */
export function prepend(second, first) {
  return append_builder(from_bit_array(first), second);
}

/**
 * Appends a bit array to the end of a builder.
 *
 * Runs in constant time.
 */
export function append(first, second) {
  return append_builder(first, from_bit_array(second));
}

/**
 * Joins a list of bit arrays into a single builder.
 *
 * Runs in constant time.
 */
export function concat_bit_arrays(bits) {
  let _pipe = bits;
  let _pipe$1 = $list.map(_pipe, (b) => { return from_bit_array(b); });
  return concat(_pipe$1);
}

function to_list(loop$stack, loop$acc) {
  while (true) {
    let stack = loop$stack;
    let acc = loop$acc;
    if (stack instanceof $Empty) {
      return acc;
    } else {
      let $ = stack.head;
      if ($ instanceof $Empty) {
        let remaining_stack = stack.tail;
        loop$stack = remaining_stack;
        loop$acc = acc;
      } else {
        let $1 = $.head;
        if ($1 instanceof Bytes) {
          let remaining_stack = stack.tail;
          let rest = $.tail;
          let bits = $1[0];
          loop$stack = listPrepend(rest, remaining_stack);
          loop$acc = listPrepend(bits, acc);
        } else if ($1 instanceof Text) {
          let remaining_stack = stack.tail;
          let rest = $.tail;
          let builder = $1[0];
          let bits = $bit_array.from_string($string_builder.to_string(builder));
          loop$stack = listPrepend(rest, remaining_stack);
          loop$acc = listPrepend(bits, acc);
        } else {
          let remaining_stack = stack.tail;
          let rest = $.tail;
          let builders = $1[0];
          loop$stack = listPrepend(builders, listPrepend(rest, remaining_stack));
          loop$acc = acc;
        }
      }
    }
  }
}

/**
 * Turns an builder into a bit array.
 *
 * Runs in linear time.
 *
 * When running on Erlang this function is implemented natively by the
 * virtual machine and is highly optimised.
 */
export function to_bit_array(builder) {
  let _pipe = toList([toList([builder])]);
  let _pipe$1 = to_list(_pipe, toList([]));
  let _pipe$2 = $list.reverse(_pipe$1);
  return $bit_array.concat(_pipe$2);
}

/**
 * Returns the size of the builder's content in bytes.
 *
 * Runs in linear time.
 */
export function byte_size(builder) {
  let _pipe = toList([toList([builder])]);
  let _pipe$1 = to_list(_pipe, toList([]));
  return $list.fold(
    _pipe$1,
    0,
    (acc, builder) => { return $bit_array.byte_size(builder) + acc; },
  );
}
