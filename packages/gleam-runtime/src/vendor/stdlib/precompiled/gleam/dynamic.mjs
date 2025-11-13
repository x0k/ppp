import {
  Ok,
  Error,
  toList,
  Empty as $Empty,
  prepend as listPrepend,
  CustomType as $CustomType,
} from "../gleam.mjs";
import * as $dict from "../gleam/dict.mjs";
import * as $int from "../gleam/int.mjs";
import * as $list from "../gleam/list.mjs";
import * as $option from "../gleam/option.mjs";
import * as $result from "../gleam/result.mjs";
import * as $string_builder from "../gleam/string_builder.mjs";
import {
  identity as do_from,
  identity as do_unsafe_coerce,
  decode_bit_array,
  decode_string,
  classify_dynamic as do_classify,
  decode_int,
  decode_float,
  decode_bool,
  decode_list,
  decode_result,
  decode_option as decode_optional,
  decode_field,
  decode_tuple,
  decode_tuple2,
  decode_tuple3,
  decode_tuple4,
  decode_tuple5,
  decode_tuple6,
  tuple_get,
  length as tuple_size,
  decode_map,
} from "../gleam_stdlib.mjs";

export class DecodeError extends $CustomType {
  constructor(expected, found, path) {
    super();
    this.expected = expected;
    this.found = found;
    this.path = path;
  }
}
export const DecodeError$DecodeError = (expected, found, path) =>
  new DecodeError(expected, found, path);
export const DecodeError$isDecodeError = (value) =>
  value instanceof DecodeError;
export const DecodeError$DecodeError$expected = (value) => value.expected;
export const DecodeError$DecodeError$0 = (value) => value.expected;
export const DecodeError$DecodeError$found = (value) => value.found;
export const DecodeError$DecodeError$1 = (value) => value.found;
export const DecodeError$DecodeError$path = (value) => value.path;
export const DecodeError$DecodeError$2 = (value) => value.path;

/**
 * Converts any Gleam data into `Dynamic` data.
 */
export function from(a) {
  return do_from(a);
}

export function unsafe_coerce(a) {
  return do_unsafe_coerce(a);
}

/**
 * Decodes a `Dynamic` value from a `Dynamic` value.
 *
 * This function doesn't seem very useful at first, but it can be convenient
 * when you need to give a decoder function but you don't actually care what
 * the to-decode value is.
 */
export function dynamic(value) {
  return new Ok(value);
}

/**
 * Checks to see whether a `Dynamic` value is a bit array, and returns that bit
 * array if it is.
 *
 * ## Examples
 *
 * ```gleam
 * import gleam/bit_array
 *
 * bit_array(from("Hello")) == bit_array.from_string("Hello")
 * // -> True
 * ```
 *
 * ```gleam
 * bit_array(from(123))
 * // -> Error([DecodeError(expected: "BitArray", found: "Int", path: [])])
 * ```
 */
export function bit_array(data) {
  return decode_bit_array(data);
}

/**
 * Checks to see whether a `Dynamic` value is a string, and returns that string if
 * it is.
 *
 * ## Examples
 *
 * ```gleam
 * string(from("Hello"))
 * // -> Ok("Hello")
 * ```
 *
 * ```gleam
 * string(from(123))
 * // -> Error([DecodeError(expected: "String", found: "Int", path: [])])
 * ```
 */
export function string(data) {
  return decode_string(data);
}

/**
 * Return a string indicating the type of the dynamic value.
 *
 * ```gleam
 * classify(from("Hello"))
 * // -> "String"
 * ```
 */
export function classify(data) {
  return do_classify(data);
}

/**
 * Checks to see whether a `Dynamic` value is an int, and returns that int if it
 * is.
 *
 * ## Examples
 *
 * ```gleam
 * int(from(123))
 * // -> Ok(123)
 * ```
 *
 * ```gleam
 * int(from("Hello"))
 * // -> Error([DecodeError(expected: "Int", found: "String", path: [])])
 * ```
 */
export function int(data) {
  return decode_int(data);
}

/**
 * Checks to see whether a `Dynamic` value is a float, and returns that float if
 * it is.
 *
 * ## Examples
 *
 * ```gleam
 * float(from(2.0))
 * // -> Ok(2.0)
 * ```
 *
 * ```gleam
 * float(from(123))
 * // -> Error([DecodeError(expected: "Float", found: "Int", path: [])])
 * ```
 */
export function float(data) {
  return decode_float(data);
}

/**
 * Checks to see whether a `Dynamic` value is a bool, and returns that bool if
 * it is.
 *
 * ## Examples
 *
 * ```gleam
 * bool(from(True))
 * // -> Ok(True)
 * ```
 *
 * ```gleam
 * bool(from(123))
 * // -> Error([DecodeError(expected: "Bool", found: "Int", path: [])])
 * ```
 */
export function bool(data) {
  return decode_bool(data);
}

/**
 * Checks to see whether a `Dynamic` value is a list, and returns that list if it
 * is. The types of the elements are not checked.
 *
 * If you wish to decode all the elements in the list use the `list` function
 * instead.
 *
 * ## Examples
 *
 * ```gleam
 * shallow_list(from(["a", "b", "c"]))
 * // -> Ok([from("a"), from("b"), from("c")])
 * ```
 *
 * ```gleam
 * shallow_list(1)
 * // -> Error([DecodeError(expected: "List", found: "Int", path: [])])
 * ```
 */
export function shallow_list(value) {
  return decode_list(value);
}

/**
 * Checks to see if a `Dynamic` value is a nullable version of a particular
 * type, and returns a corresponding `Option` if it is.
 *
 * ## Examples
 *
 * ```gleam
 * from("Hello") |> optional(string)
 * // -> Ok(Some("Hello"))
 * ```
 *
 * ```gleam
 * from("Hello") |> optional(string)
 * // -> Ok(Some("Hello"))
 * ```
 *
 * ```gleam
 * // `gleam/erlang/*` is available via the `gleam_erlang` package
 * import gleam/erlang/atom
 *
 * from(atom.from_string("null")) |> optional(string)
 * // -> Ok(None)
 * ```
 *
 * ```gleam
 * // `gleam/erlang/*` is available via the `gleam_erlang` package
 * import gleam/erlang/atom
 *
 * from(atom.from_string("nil")) |> optional(string)
 * // -> Ok(None)
 * ```
 *
 * ```gleam
 * // `gleam/erlang/*` is available via the `gleam_erlang` package
 * import gleam/erlang/atom
 *
 * from(atom.from_string("undefined")) |> optional(string)
 * // -> Ok(None)
 * ```
 *
 * ```gleam
 * from(123) |> optional(string)
 * // -> Error([DecodeError(expected: "String", found: "Int", path: [])])
 * ```
 */
export function optional(decode) {
  return (value) => { return decode_optional(value, decode); };
}

function at_least_decode_tuple_error(size, data) {
  let _block;
  if (size === 1) {
    _block = "";
  } else {
    _block = "s";
  }
  let s = _block;
  let _block$1;
  let _pipe = toList(["Tuple of at least ", $int.to_string(size), " element", s]);
  let _pipe$1 = $string_builder.from_strings(_pipe);
  let _pipe$2 = $string_builder.to_string(_pipe$1);
  _block$1 = new DecodeError(_pipe$2, classify(data), toList([]));
  let error = _block$1;
  return new Error(toList([error]));
}

/**
 * Joins multiple decoders into one. When run they will each be tried in turn
 * until one succeeds, or they all fail.
 *
 * ## Examples
 *
 * ```gleam
 * import gleam/result
 *
 * let bool_or_string = any(of: [
 *   string,
 *   fn(x) { result.map(bool(x), fn(_) { "a bool" }) }
 * ])
 *
 * bool_or_string(from("ok"))
 * // -> Ok("ok")
 *
 * bool_or_string(from(True))
 * // -> Ok("a bool")
 *
 * bool_or_string(from(1))
 * // -> Error(DecodeError(expected: "another type", found: "Int", path: []))
 * ```
 */
export function any(decoders) {
  return (data) => {
    if (decoders instanceof $Empty) {
      return new Error(
        toList([new DecodeError("another type", classify(data), toList([]))]),
      );
    } else {
      let decoder = decoders.head;
      let decoders$1 = decoders.tail;
      let $ = decoder(data);
      if ($ instanceof Ok) {
        return $;
      } else {
        return any(decoders$1)(data);
      }
    }
  };
}

function all_errors(result) {
  if (result instanceof Ok) {
    return toList([]);
  } else {
    let errors = result[0];
    return errors;
  }
}

/**
 * Decode 1 value from a `Dynamic` value.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2.0, "3")) |> decode1(MyRecord, element(0, int))
 * // -> Ok(MyRecord(1))
 * ```
 *
 * ```gleam
 * from(#("", "", "")) |> decode1(MyRecord, element(0, int))
 * // -> Error([
 * //   DecodeError(expected: "Int", found: "String", path: ["0"]),
 * // ])
 * ```
 */
export function decode1(constructor, t1) {
  return (value) => {
    let $ = t1(value);
    if ($ instanceof Ok) {
      let a = $[0];
      return new Ok(constructor(a));
    } else {
      let a = $;
      return new Error(all_errors(a));
    }
  };
}

/**
 * Checks to see whether a `Dynamic` value is a result of a particular type, and
 * returns that result if it is.
 *
 * The `ok` and `error` arguments are decoders for decoding the `Ok` and
 * `Error` values of the result.
 *
 * ## Examples
 *
 * ```gleam
 * from(Ok(1)) |> result(ok: int, error: string)
 * // -> Ok(Ok(1))
 * ```
 *
 * ```gleam
 * from(Error("boom")) |> result(ok: int, error: string)
 * // -> Ok(Error("boom"))
 * ```
 *
 * ```gleam
 * from(123) |> result(ok: int, error: string)
 * // -> Error([DecodeError(expected: "Result", found: "Int", path: [])])
 * ```
 */
export function result(decode_ok, decode_error) {
  return (value) => {
    return $result.try$(
      decode_result(value),
      (inner_result) => {
        if (inner_result instanceof Ok) {
          let raw = inner_result[0];
          return $result.try$(
            (() => {
              let _pipe = decode_ok(raw);
              return map_errors(
                _pipe,
                (_capture) => { return push_path(_capture, "ok"); },
              );
            })(),
            (value) => { return new Ok(new Ok(value)); },
          );
        } else {
          let raw = inner_result[0];
          return $result.try$(
            (() => {
              let _pipe = decode_error(raw);
              return map_errors(
                _pipe,
                (_capture) => { return push_path(_capture, "error"); },
              );
            })(),
            (value) => { return new Ok(new Error(value)); },
          );
        }
      },
    );
  };
}

function push_path(error, name) {
  let name$1 = from(name);
  let decoder = any(
    toList([string, (x) => { return $result.map(int(x), $int.to_string); }]),
  );
  let _block;
  let $ = decoder(name$1);
  if ($ instanceof Ok) {
    let name$2 = $[0];
    _block = name$2;
  } else {
    let _pipe = toList(["<", classify(name$1), ">"]);
    let _pipe$1 = $string_builder.from_strings(_pipe);
    _block = $string_builder.to_string(_pipe$1);
  }
  let name$2 = _block;
  return new DecodeError(
    error.expected,
    error.found,
    listPrepend(name$2, error.path),
  );
}

/**
 * Checks to see whether a `Dynamic` value is a list of a particular type, and
 * returns that list if it is.
 *
 * The second argument is a decoder function used to decode the elements of
 * the list. The list is only decoded if all elements in the list can be
 * successfully decoded using this function.
 *
 * If you do not wish to decode all the elements in the list use the `shallow_list`
 * function instead.
 *
 * ## Examples
 *
 * ```gleam
 * from(["a", "b", "c"]) |> list(of: string)
 * // -> Ok(["a", "b", "c"])
 * ```
 *
 * ```gleam
 * from([1, 2, 3]) |> list(of: string)
 * // -> Error([DecodeError(expected: "String", found: "Int", path: ["*"])])
 * ```
 *
 * ```gleam
 * from("ok") |> list(of: string)
 * // -> Error([DecodeError(expected: "List", found: "String", path: [])])
 * ```
 */
export function list(decoder_type) {
  return (dynamic) => {
    return $result.try$(
      shallow_list(dynamic),
      (list) => {
        let _pipe = list;
        let _pipe$1 = $list.try_map(_pipe, decoder_type);
        return map_errors(
          _pipe$1,
          (_capture) => { return push_path(_capture, "*"); },
        );
      },
    );
  };
}

function map_errors(result, f) {
  return $result.map_error(
    result,
    (_capture) => { return $list.map(_capture, f); },
  );
}

/**
 * Checks to see if a `Dynamic` value is a map with a specific field, and returns
 * the value of that field if it is.
 *
 * This will not succeed on a record.
 *
 * ## Examples
 *
 * ```gleam
 * import gleam/dict
 * dict.new()
 * |> dict.insert("Hello", "World")
 * |> from
 * |> field(named: "Hello", of: string)
 * // -> Ok("World")
 * ```
 *
 * ```gleam
 * from(123) |> field("Hello", string)
 * // -> Error([DecodeError(expected: "Map", found: "Int", path: [])])
 * ```
 */
export function field(name, inner_type) {
  return (value) => {
    let missing_field_error = new DecodeError("field", "nothing", toList([]));
    return $result.try$(
      decode_field(value, name),
      (maybe_inner) => {
        let _pipe = maybe_inner;
        let _pipe$1 = $option.to_result(_pipe, toList([missing_field_error]));
        let _pipe$2 = $result.try$(_pipe$1, inner_type);
        return map_errors(
          _pipe$2,
          (_capture) => { return push_path(_capture, name); },
        );
      },
    );
  };
}

/**
 * Checks to see if a `Dynamic` value is a map with a specific field.
 * If the map does not have the specified field, returns an `Ok(None)` instead of failing; otherwise,
 * returns the decoded field wrapped in `Some(_)`.
 *
 * ## Examples
 *
 * ```gleam
 * import gleam/dict
 * dict.new()
 * |> dict.insert("Hello", "World")
 * |> from
 * |> optional_field(named: "Hello", of: string)
 * // -> Ok(Some("World"))
 * ```
 *
 * ```gleam
 * import gleam/dict
 * dict.new()
 * |> from
 * |> optional_field(named: "Hello", of: string)
 * // -> Ok(None)
 * ```
 *
 * ```gleam
 * from(123)
 * |> optional_field("Hello", string)
 * // -> Error([DecodeError(expected: "Map", found: "Int", path: [])])
 * ```
 */
export function optional_field(name, inner_type) {
  return (value) => {
    return $result.try$(
      decode_field(value, name),
      (maybe_inner) => {
        if (maybe_inner instanceof $option.Some) {
          let dynamic_inner = maybe_inner[0];
          let _pipe = dynamic_inner;
          let _pipe$1 = decode_optional(_pipe, inner_type);
          return map_errors(
            _pipe$1,
            (_capture) => { return push_path(_capture, name); },
          );
        } else {
          return new Ok(new $option.None());
        }
      },
    );
  };
}

/**
 * Checks to see if a `Dynamic` value is a tuple large enough to have a certain
 * index, and returns the value of that index if it is.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2))
 * |> element(0, int)
 * // -> Ok(from(1))
 * ```
 *
 * ```gleam
 * from(#(1, 2))
 * |> element(2, int)
 * // -> Error([
 * //   DecodeError(
 * //     expected: "Tuple of at least 3 elements",
 * //     found: "Tuple of 2 elements",
 * //     path: [],
 * //   ),
 * // ])
 * ```
 */
export function element(index, inner_type) {
  return (data) => {
    return $result.try$(
      decode_tuple(data),
      (tuple) => {
        let size = tuple_size(tuple);
        return $result.try$(
          (() => {
            let $ = index >= 0;
            if ($) {
              let $1 = index < size;
              if ($1) {
                return tuple_get(tuple, index);
              } else {
                return at_least_decode_tuple_error(index + 1, data);
              }
            } else {
              let $1 = $int.absolute_value(index) <= size;
              if ($1) {
                return tuple_get(tuple, size + index);
              } else {
                return at_least_decode_tuple_error(
                  $int.absolute_value(index),
                  data,
                );
              }
            }
          })(),
          (data) => {
            let _pipe = inner_type(data);
            return map_errors(
              _pipe,
              (_capture) => { return push_path(_capture, index); },
            );
          },
        );
      },
    );
  };
}

function tuple_errors(result, name) {
  if (result instanceof Ok) {
    return toList([]);
  } else {
    let errors = result[0];
    return $list.map(
      errors,
      (_capture) => { return push_path(_capture, name); },
    );
  }
}

/**
 * Checks to see if a `Dynamic` value is a 2-element tuple, list or array containing
 * specifically typed elements.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2))
 * |> tuple2(int, int)
 * // -> Ok(#(1, 2))
 * ```
 *
 * ```gleam
 * from(#(1, 2.0))
 * |> tuple2(int, float)
 * // -> Ok(#(1, 2.0))
 * ```
 *
 * ```gleam
 * from([1, 2])
 * |> tuple2(int, int)
 * // -> Ok(#(1, 2))
 * ```
 *
 * ```gleam
 * from([from(1), from(2.0)])
 * |> tuple2(int, float)
 * // -> Ok(#(1, 2.0))
 * ```
 *
 * ```gleam
 * from(#(1, 2, 3))
 * |> tuple2(int, float)
 * // -> Error([
 * //   DecodeError(
 * //     expected: "Tuple of 2 elements",
 * //     found: "Tuple of 3 elements",
 * //     path: [],
 * //   ),
 * // ])
 * ```
 *
 * ```gleam
 * from("")
 * |> tuple2(int, float)
 * // -> Error([
 * //   DecodeError(
 * //     expected: "Tuple of 2 elements",
 * //     found: "String",
 * //     path: [],
 * //   ),
 * // ])
 * ```
 */
export function tuple2(decode1, decode2) {
  return (value) => {
    return $result.try$(
      decode_tuple2(value),
      (_use0) => {
        let a;
        let b;
        a = _use0[0];
        b = _use0[1];
        let $ = decode1(a);
        let $1 = decode2(b);
        if ($ instanceof Ok && $1 instanceof Ok) {
          let a$1 = $[0];
          let b$1 = $1[0];
          return new Ok([a$1, b$1]);
        } else {
          let a$1 = $;
          let b$1 = $1;
          let _pipe = tuple_errors(a$1, "0");
          let _pipe$1 = $list.append(_pipe, tuple_errors(b$1, "1"));
          return new Error(_pipe$1);
        }
      },
    );
  };
}

/**
 * Checks to see if a `Dynamic` value is a 3-element tuple, list or array containing
 * specifically typed elements.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2, 3))
 * |> tuple3(int, int, int)
 * // -> Ok(#(1, 2, 3))
 * ```
 *
 * ```gleam
 * from(#(1, 2.0, "3"))
 * |> tuple3(int, float, string)
 * // -> Ok(#(1, 2.0, "3"))
 * ```
 *
 * ```gleam
 * from([1, 2, 3])
 * |> tuple3(int, int, int)
 * // -> Ok(#(1, 2, 3))
 * ```
 *
 * ```gleam
 * from([from(1), from(2.0), from("3")])
 * |> tuple3(int, float, string)
 * // -> Ok(#(1, 2.0, "3"))
 * ```
 *
 * ```gleam
 * from(#(1, 2))
 * |> tuple3(int, float, string)
 * // -> Error([
 * //   DecodeError(
 * //     expected: "Tuple of 3 elements",
 * //     found: "Tuple of 2 elements",
 * //     path: [],
 * //   ),
 * // ])
 * ```
 *
 * ```gleam
 * from("")
 * |> tuple3(int, float, string)
 * // -> Error([
 * //   DecodeError(
 * //     expected: "Tuple of 3 elements",
 * //     found: "String",
 * //     path: [],
 * //   ),
 * // ])
 * ```
 */
export function tuple3(decode1, decode2, decode3) {
  return (value) => {
    return $result.try$(
      decode_tuple3(value),
      (_use0) => {
        let a;
        let b;
        let c;
        a = _use0[0];
        b = _use0[1];
        c = _use0[2];
        let $ = decode1(a);
        let $1 = decode2(b);
        let $2 = decode3(c);
        if ($ instanceof Ok && $1 instanceof Ok && $2 instanceof Ok) {
          let a$1 = $[0];
          let b$1 = $1[0];
          let c$1 = $2[0];
          return new Ok([a$1, b$1, c$1]);
        } else {
          let a$1 = $;
          let b$1 = $1;
          let c$1 = $2;
          let _pipe = tuple_errors(a$1, "0");
          let _pipe$1 = $list.append(_pipe, tuple_errors(b$1, "1"));
          let _pipe$2 = $list.append(_pipe$1, tuple_errors(c$1, "2"));
          return new Error(_pipe$2);
        }
      },
    );
  };
}

/**
 * Checks to see if a `Dynamic` value is a 4-element tuple, list or array containing
 * specifically typed elements.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2, 3, 4))
 * |> tuple4(int, int, int, int)
 * // -> Ok(#(1, 2, 3, 4))
 * ```
 *
 * ```gleam
 * from(#(1, 2.0, "3", 4))
 * |> tuple4(int, float, string, int)
 * // -> Ok(#(1, 2.0, "3", 4))
 * ```
 *
 * ```gleam
 * from([1, 2, 3, 4])
 * |> tuple4(int, int, int, int)
 * // -> Ok(#(1, 2, 3, 4))
 * ```
 *
 * ```gleam
 * from([from(1), from(2.0), from("3"), from(4)])
 * |> tuple4(int, float, string, int)
 * // -> Ok(#(1, 2.0, "3", 4))
 * ```
 *
 * ```gleam
 * from(#(1, 2))
 * |> tuple4(int, float, string, int)
 * // -> Error([
 * //   DecodeError(
 * //     expected: "Tuple of 4 elements",
 * //     found: "Tuple of 2 elements",
 * //     path: [],
 * //   ),
 * // ])
 * ```
 *
 * ```gleam
 * from("")
 * |> tuple4(int, float, string, int)
 * // -> Error([
 * //   DecodeError(
 * //     expected: "Tuple of 4 elements",
 * //     found: "String",
 * //     path: [],
 * //   ),
 * // ])
 * ```
 */
export function tuple4(decode1, decode2, decode3, decode4) {
  return (value) => {
    return $result.try$(
      decode_tuple4(value),
      (_use0) => {
        let a;
        let b;
        let c;
        let d;
        a = _use0[0];
        b = _use0[1];
        c = _use0[2];
        d = _use0[3];
        let $ = decode1(a);
        let $1 = decode2(b);
        let $2 = decode3(c);
        let $3 = decode4(d);
        if (
          $ instanceof Ok &&
          $1 instanceof Ok &&
          $2 instanceof Ok &&
          $3 instanceof Ok
        ) {
          let a$1 = $[0];
          let b$1 = $1[0];
          let c$1 = $2[0];
          let d$1 = $3[0];
          return new Ok([a$1, b$1, c$1, d$1]);
        } else {
          let a$1 = $;
          let b$1 = $1;
          let c$1 = $2;
          let d$1 = $3;
          let _pipe = tuple_errors(a$1, "0");
          let _pipe$1 = $list.append(_pipe, tuple_errors(b$1, "1"));
          let _pipe$2 = $list.append(_pipe$1, tuple_errors(c$1, "2"));
          let _pipe$3 = $list.append(_pipe$2, tuple_errors(d$1, "3"));
          return new Error(_pipe$3);
        }
      },
    );
  };
}

/**
 * Checks to see if a `Dynamic` value is a 5-element tuple, list or array containing
 * specifically typed elements.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2, 3, 4, 5))
 * |> tuple5(int, int, int, int, int)
 * // -> Ok(#(1, 2, 3, 4, 5))
 * ```
 *
 * ```gleam
 * from(#(1, 2.0, "3", 4, 5))
 * |> tuple5(int, float, string, int, int)
 * // -> Ok(#(1, 2.0, "3", 4, 5))
 * ```
 *
 * ```gleam
 * from([1, 2, 3, 4, 5])
 * |> tuple5(int, int, int, int, int)
 * // -> Ok(#(1, 2, 3, 4, 5))
 * ```
 *
 * ```gleam
 * from([from(1), from(2.0), from("3"), from(4), from(True)])
 * |> tuple5(int, float, string, int, bool)
 * // -> Ok(#(1, 2.0, "3", 4, True))
 * ```
 *
 * ```gleam
 * from(#(1, 2))
 * |> tuple5(int, float, string, int, int)
 * // -> Error([
 * //   DecodeError(
 * //     expected: "Tuple of 5 elements",
 * //     found: "Tuple of 2 elements",
 * //     path: [],
 * //   ),
 * // ])
 * ```
 *
 * ```gleam
 * from("")
 * |> tuple5(int, float, string, int, int)
 * // -> Error([
 * //   DecodeError(
 * //     expected: "Tuple of 5 elements",
 * //     found: "String",
 * //     path: [],
 * //   ),
 * // ])
 * ```
 */
export function tuple5(decode1, decode2, decode3, decode4, decode5) {
  return (value) => {
    return $result.try$(
      decode_tuple5(value),
      (_use0) => {
        let a;
        let b;
        let c;
        let d;
        let e;
        a = _use0[0];
        b = _use0[1];
        c = _use0[2];
        d = _use0[3];
        e = _use0[4];
        let $ = decode1(a);
        let $1 = decode2(b);
        let $2 = decode3(c);
        let $3 = decode4(d);
        let $4 = decode5(e);
        if (
          $ instanceof Ok &&
          $1 instanceof Ok &&
          $2 instanceof Ok &&
          $3 instanceof Ok &&
          $4 instanceof Ok
        ) {
          let a$1 = $[0];
          let b$1 = $1[0];
          let c$1 = $2[0];
          let d$1 = $3[0];
          let e$1 = $4[0];
          return new Ok([a$1, b$1, c$1, d$1, e$1]);
        } else {
          let a$1 = $;
          let b$1 = $1;
          let c$1 = $2;
          let d$1 = $3;
          let e$1 = $4;
          let _pipe = tuple_errors(a$1, "0");
          let _pipe$1 = $list.append(_pipe, tuple_errors(b$1, "1"));
          let _pipe$2 = $list.append(_pipe$1, tuple_errors(c$1, "2"));
          let _pipe$3 = $list.append(_pipe$2, tuple_errors(d$1, "3"));
          let _pipe$4 = $list.append(_pipe$3, tuple_errors(e$1, "4"));
          return new Error(_pipe$4);
        }
      },
    );
  };
}

/**
 * Checks to see if a `Dynamic` value is a 6-element tuple, list or array containing
 * specifically typed elements.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2, 3, 4, 5, 6))
 * |> tuple6(int, int, int, int, int, int)
 * // -> Ok(#(1, 2, 3, 4, 5, 6))
 * ```
 *
 * ```gleam
 * from(#(1, 2.0, "3", 4, 5, 6))
 * |> tuple6(int, float, string, int, int, int)
 * // -> Ok(#(1, 2.0, "3", 4, 5, 6))
 * ```
 *
 * ```gleam
 * from([1, 2, 3, 4, 5, 6])
 * |> tuple6(int, int, int, int, int, int)
 * // -> Ok(#(1, 2, 3, 4, 5, 6))
 * ```
 *
 * ```gleam
 * from([from(1), from(2.0), from("3"), from(4), from(True), from(False)])
 * |> tuple6(int, float, string, int, bool, bool)
 * // -> Ok(#(1, 2.0, "3", 4, True, False))
 * ```
 *
 * ```gleam
 * from(#(1, 2))
 * |> tuple6(int, float, string, int, int, int)
 * // -> Error([
 * //   DecodeError(
 * //     expected: "Tuple of 6 elements",
 * //     found: "Tuple of 2 elements",
 * //     path: [],
 * //   ),
 * // ])
 * ```
 *
 * ```gleam
 * from("")
 * |> tuple6(int, float, string, int, int, int)
 * // -> Error([
 * //   DecodeError(
 * //     expected: "Tuple of 6 elements",
 * //     found: "String",
 * //     path: [],
 * //  ),
 * // ])
 * ```
 */
export function tuple6(decode1, decode2, decode3, decode4, decode5, decode6) {
  return (value) => {
    return $result.try$(
      decode_tuple6(value),
      (_use0) => {
        let a;
        let b;
        let c;
        let d;
        let e;
        let f;
        a = _use0[0];
        b = _use0[1];
        c = _use0[2];
        d = _use0[3];
        e = _use0[4];
        f = _use0[5];
        let $ = decode1(a);
        let $1 = decode2(b);
        let $2 = decode3(c);
        let $3 = decode4(d);
        let $4 = decode5(e);
        let $5 = decode6(f);
        if (
          $ instanceof Ok &&
          $1 instanceof Ok &&
          $2 instanceof Ok &&
          $3 instanceof Ok &&
          $4 instanceof Ok &&
          $5 instanceof Ok
        ) {
          let a$1 = $[0];
          let b$1 = $1[0];
          let c$1 = $2[0];
          let d$1 = $3[0];
          let e$1 = $4[0];
          let f$1 = $5[0];
          return new Ok([a$1, b$1, c$1, d$1, e$1, f$1]);
        } else {
          let a$1 = $;
          let b$1 = $1;
          let c$1 = $2;
          let d$1 = $3;
          let e$1 = $4;
          let f$1 = $5;
          let _pipe = tuple_errors(a$1, "0");
          let _pipe$1 = $list.append(_pipe, tuple_errors(b$1, "1"));
          let _pipe$2 = $list.append(_pipe$1, tuple_errors(c$1, "2"));
          let _pipe$3 = $list.append(_pipe$2, tuple_errors(d$1, "3"));
          let _pipe$4 = $list.append(_pipe$3, tuple_errors(e$1, "4"));
          let _pipe$5 = $list.append(_pipe$4, tuple_errors(f$1, "5"));
          return new Error(_pipe$5);
        }
      },
    );
  };
}

/**
 * Checks to see if a `Dynamic` value is a dict.
 *
 * ## Examples
 *
 * ```gleam
 * import gleam/dict
 * dict.new() |> from |> dict(string, int)
 * // -> Ok(dict.new())
 * ```
 *
 * ```gleam
 * from(1) |> dict(string, int)
 * // -> Error(DecodeError(expected: "Map", found: "Int", path: []))
 * ```
 *
 * ```gleam
 * from("") |> dict(string, int)
 * // -> Error(DecodeError(expected: "Map", found: "String", path: []))
 * ```
 */
export function dict(key_type, value_type) {
  return (value) => {
    return $result.try$(
      decode_map(value),
      (map) => {
        return $result.try$(
          (() => {
            let _pipe = map;
            let _pipe$1 = $dict.to_list(_pipe);
            return $list.try_map(
              _pipe$1,
              (pair) => {
                let k;
                let v;
                k = pair[0];
                v = pair[1];
                return $result.try$(
                  (() => {
                    let _pipe$2 = key_type(k);
                    return map_errors(
                      _pipe$2,
                      (_capture) => { return push_path(_capture, "keys"); },
                    );
                  })(),
                  (k) => {
                    return $result.try$(
                      (() => {
                        let _pipe$2 = value_type(v);
                        return map_errors(
                          _pipe$2,
                          (_capture) => { return push_path(_capture, "values"); },
                        );
                      })(),
                      (v) => { return new Ok([k, v]); },
                    );
                  },
                );
              },
            );
          })(),
          (pairs) => { return new Ok($dict.from_list(pairs)); },
        );
      },
    );
  };
}

/**
 * Decode 2 values from a `Dynamic` value.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2.0, "3"))
 * |> decode2(MyRecord, element(0, int), element(1, float))
 * // -> Ok(MyRecord(1, 2.0))
 * ```
 *
 * ```gleam
 * from(#("", "", ""))
 * |> decode2(MyRecord, element(0, int), element(1, float))
 * // -> Error([
 * //   DecodeError(expected: "Int", found: "String", path: ["0"]),
 * //   DecodeError(expected: "Float", found: "String", path: ["1"]),
 * // ])
 * ```
 */
export function decode2(constructor, t1, t2) {
  return (value) => {
    let $ = t1(value);
    let $1 = t2(value);
    if ($ instanceof Ok && $1 instanceof Ok) {
      let a = $[0];
      let b = $1[0];
      return new Ok(constructor(a, b));
    } else {
      let a = $;
      let b = $1;
      return new Error($list.concat(toList([all_errors(a), all_errors(b)])));
    }
  };
}

/**
 * Decode 3 values from a `Dynamic` value.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2.0, "3"))
 * |> decode3(MyRecord, element(0, int), element(1, float), element(2, string))
 * // -> Ok(MyRecord(1, 2.0, "3"))
 * ```
 *
 * ```gleam
 * from(#("", "", ""))
 * |> decode3(MyRecord, element(0, int), element(1, float), element(2, string))
 * // -> Error([
 * //   DecodeError(expected: "Int", found: "String", path: ["0"]),
 * //   DecodeError(expected: "Float", found: "String", path: ["1"]),
 * // ])
 * ```
 */
export function decode3(constructor, t1, t2, t3) {
  return (value) => {
    let $ = t1(value);
    let $1 = t2(value);
    let $2 = t3(value);
    if ($ instanceof Ok && $1 instanceof Ok && $2 instanceof Ok) {
      let a = $[0];
      let b = $1[0];
      let c = $2[0];
      return new Ok(constructor(a, b, c));
    } else {
      let a = $;
      let b = $1;
      let c = $2;
      return new Error(
        $list.concat(toList([all_errors(a), all_errors(b), all_errors(c)])),
      );
    }
  };
}

/**
 * Decode 4 values from a `Dynamic` value.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2.1, "3", "4"))
 * |> decode4(
 *   MyRecord,
 *   element(0, int),
 *   element(1, float),
 *   element(2, string),
 *   element(3, string),
 * )
 * // -> Ok(MyRecord(1, 2.1, "3", "4"))
 * ```
 *
 * ```gleam
 * from(#("", "", "", ""))
 * |> decode4(
 *   MyRecord,
 *   element(0, int),
 *   element(1, float),
 *   element(2, string),
 *   element(3, string),
 * )
 * // -> Error([
 * //   DecodeError(expected: "Int", found: "String", path: ["0"]),
 * //   DecodeError(expected: "Float", found: "String", path: ["1"]),
 * // ])
 * ```
 */
export function decode4(constructor, t1, t2, t3, t4) {
  return (x) => {
    let $ = t1(x);
    let $1 = t2(x);
    let $2 = t3(x);
    let $3 = t4(x);
    if (
      $ instanceof Ok &&
      $1 instanceof Ok &&
      $2 instanceof Ok &&
      $3 instanceof Ok
    ) {
      let a = $[0];
      let b = $1[0];
      let c = $2[0];
      let d = $3[0];
      return new Ok(constructor(a, b, c, d));
    } else {
      let a = $;
      let b = $1;
      let c = $2;
      let d = $3;
      return new Error(
        $list.concat(
          toList([all_errors(a), all_errors(b), all_errors(c), all_errors(d)]),
        ),
      );
    }
  };
}

/**
 * Decode 5 values from a `Dynamic` value.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2.1, "3", "4", "5"))
 * |> decode5(
 *   MyRecord,
 *   element(0, int),
 *   element(1, float),
 *   element(2, string),
 *   element(3, string),
 *   element(4, string),
 * )
 * // -> Ok(MyRecord(1, 2.1, "3", "4", "5"))
 * ```
 *
 * ```gleam
 * from(#("", "", "", "", ""))
 * |> decode5(
 *   MyRecord,
 *   element(0, int),
 *   element(1, float),
 *   element(2, string),
 *   element(3, string),
 *   element(4, string),
 * )
 * // -> Error([
 * //   DecodeError(expected: "Int", found: "String", path: ["0"]),
 * //   DecodeError(expected: "Float", found: "String", path: ["1"]),
 * // ])
 * ```
 */
export function decode5(constructor, t1, t2, t3, t4, t5) {
  return (x) => {
    let $ = t1(x);
    let $1 = t2(x);
    let $2 = t3(x);
    let $3 = t4(x);
    let $4 = t5(x);
    if (
      $ instanceof Ok &&
      $1 instanceof Ok &&
      $2 instanceof Ok &&
      $3 instanceof Ok &&
      $4 instanceof Ok
    ) {
      let a = $[0];
      let b = $1[0];
      let c = $2[0];
      let d = $3[0];
      let e = $4[0];
      return new Ok(constructor(a, b, c, d, e));
    } else {
      let a = $;
      let b = $1;
      let c = $2;
      let d = $3;
      let e = $4;
      return new Error(
        $list.concat(
          toList([
            all_errors(a),
            all_errors(b),
            all_errors(c),
            all_errors(d),
            all_errors(e),
          ]),
        ),
      );
    }
  };
}

/**
 * Decode 6 values from a `Dynamic` value.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2.1, "3", "4", "5", "6"))
 * |> decode6(
 *   MyRecord,
 *   element(0, int),
 *   element(1, float),
 *   element(2, string),
 *   element(3, string),
 *   element(4, string),
 *   element(5, string),
 * )
 * // -> Ok(MyRecord(1, 2.1, "3", "4", "5", "6"))
 * ```
 *
 * ```gleam
 * from(#("", "", "", "", "", ""))
 * |> decode6(
 *   MyRecord,
 *   element(0, int),
 *   element(1, float),
 *   element(2, string),
 *   element(3, string),
 *   element(4, string),
 *   element(5, string),
 * )
 * // -> Error([
 * //   DecodeError(expected: "Int", found: "String", path: ["0"]),
 * //   DecodeError(expected: "Float", found: "String", path: ["1"]),
 * // ])
 * ```
 */
export function decode6(constructor, t1, t2, t3, t4, t5, t6) {
  return (x) => {
    let $ = t1(x);
    let $1 = t2(x);
    let $2 = t3(x);
    let $3 = t4(x);
    let $4 = t5(x);
    let $5 = t6(x);
    if (
      $ instanceof Ok &&
      $1 instanceof Ok &&
      $2 instanceof Ok &&
      $3 instanceof Ok &&
      $4 instanceof Ok &&
      $5 instanceof Ok
    ) {
      let a = $[0];
      let b = $1[0];
      let c = $2[0];
      let d = $3[0];
      let e = $4[0];
      let f = $5[0];
      return new Ok(constructor(a, b, c, d, e, f));
    } else {
      let a = $;
      let b = $1;
      let c = $2;
      let d = $3;
      let e = $4;
      let f = $5;
      return new Error(
        $list.concat(
          toList([
            all_errors(a),
            all_errors(b),
            all_errors(c),
            all_errors(d),
            all_errors(e),
            all_errors(f),
          ]),
        ),
      );
    }
  };
}

/**
 * Decode 7 values from a `Dynamic` value.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2.1, "3", "4", "5", "6"))
 * |> decode7(
 *   MyRecord,
 *   element(0, int),
 *   element(1, float),
 *   element(2, string),
 *   element(3, string),
 *   element(4, string),
 *   element(5, string),
 *   element(6, string),
 * )
 * // -> Ok(MyRecord(1, 2.1, "3", "4", "5", "6", "7"))
 * ```
 *
 * ```gleam
 * from(#("", "", "", "", "", "", ""))
 * |> decode7(
 *   MyRecord,
 *   element(0, int),
 *   element(1, float),
 *   element(2, string),
 *   element(3, string),
 *   element(4, string),
 *   element(5, string),
 *   element(6, string),
 * )
 * // -> Error([
 * //   DecodeError(expected: "Int", found: "String", path: ["0"]),
 * //   DecodeError(expected: "Float", found: "String", path: ["1"]),
 * // ])
 * ```
 */
export function decode7(constructor, t1, t2, t3, t4, t5, t6, t7) {
  return (x) => {
    let $ = t1(x);
    let $1 = t2(x);
    let $2 = t3(x);
    let $3 = t4(x);
    let $4 = t5(x);
    let $5 = t6(x);
    let $6 = t7(x);
    if (
      $ instanceof Ok &&
      $1 instanceof Ok &&
      $2 instanceof Ok &&
      $3 instanceof Ok &&
      $4 instanceof Ok &&
      $5 instanceof Ok &&
      $6 instanceof Ok
    ) {
      let a = $[0];
      let b = $1[0];
      let c = $2[0];
      let d = $3[0];
      let e = $4[0];
      let f = $5[0];
      let g = $6[0];
      return new Ok(constructor(a, b, c, d, e, f, g));
    } else {
      let a = $;
      let b = $1;
      let c = $2;
      let d = $3;
      let e = $4;
      let f = $5;
      let g = $6;
      return new Error(
        $list.concat(
          toList([
            all_errors(a),
            all_errors(b),
            all_errors(c),
            all_errors(d),
            all_errors(e),
            all_errors(f),
            all_errors(g),
          ]),
        ),
      );
    }
  };
}

/**
 * Decode 8 values from a `Dynamic` value.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2.1, "3", "4", "5", "6", "7", "8"))
 * |> decode8(
 *   MyRecord,
 *   element(0, int),
 *   element(1, float),
 *   element(2, string),
 *   element(3, string),
 *   element(4, string),
 *   element(5, string),
 *   element(6, string),
 *   element(7, string),
 * )
 * // -> Ok(MyRecord(1, 2.1, "3", "4", "5", "6", "7", "8"))
 * ```
 *
 * ```gleam
 * from(#("", "", "", "", "", "", "", ""))
 * |> decode8(
 *   MyRecord,
 *   element(0, int),
 *   element(1, float),
 *   element(2, string),
 *   element(3, string),
 *   element(4, string),
 *   element(5, string),
 *   element(6, string),
 *   element(7, string),
 * )
 * // -> Error([
 * //   DecodeError(expected: "Int", found: "String", path: ["0"]),
 * //   DecodeError(expected: "Float", found: "String", path: ["1"]),
 * // ])
 * ```
 */
export function decode8(constructor, t1, t2, t3, t4, t5, t6, t7, t8) {
  return (x) => {
    let $ = t1(x);
    let $1 = t2(x);
    let $2 = t3(x);
    let $3 = t4(x);
    let $4 = t5(x);
    let $5 = t6(x);
    let $6 = t7(x);
    let $7 = t8(x);
    if (
      $ instanceof Ok &&
      $1 instanceof Ok &&
      $2 instanceof Ok &&
      $3 instanceof Ok &&
      $4 instanceof Ok &&
      $5 instanceof Ok &&
      $6 instanceof Ok &&
      $7 instanceof Ok
    ) {
      let a = $[0];
      let b = $1[0];
      let c = $2[0];
      let d = $3[0];
      let e = $4[0];
      let f = $5[0];
      let g = $6[0];
      let h = $7[0];
      return new Ok(constructor(a, b, c, d, e, f, g, h));
    } else {
      let a = $;
      let b = $1;
      let c = $2;
      let d = $3;
      let e = $4;
      let f = $5;
      let g = $6;
      let h = $7;
      return new Error(
        $list.concat(
          toList([
            all_errors(a),
            all_errors(b),
            all_errors(c),
            all_errors(d),
            all_errors(e),
            all_errors(f),
            all_errors(g),
            all_errors(h),
          ]),
        ),
      );
    }
  };
}

/**
 * Decode 9 values from a `Dynamic` value.
 *
 * ## Examples
 *
 * ```gleam
 * from(#(1, 2.1, "3", "4", "5", "6", "7", "8", "9"))
 * |> decode9(
 *   MyRecord,
 *   element(0, int),
 *   element(1, float),
 *   element(2, string),
 *   element(3, string),
 *   element(4, string),
 *   element(5, string),
 *   element(6, string),
 *   element(7, string),
 *   element(8, string),
 * )
 * // -> Ok(MyRecord(1, 2.1, "3", "4", "5", "6", "7", "8", "9"))
 * ```
 *
 * ```gleam
 * from(#("", "", "", "", "", "", "", "", ""))
 * |> decode9(
 *   MyRecord,
 *   element(0, int),
 *   element(1, float),
 *   element(2, string),
 *   element(3, string),
 *   element(4, string),
 *   element(5, string),
 *   element(6, string),
 *   element(7, string),
 *   element(8, string),
 * )
 * // -> Error([
 * //   DecodeError(expected: "Int", found: "String", path: ["0"]),
 * //   DecodeError(expected: "Float", found: "String", path: ["1"]),
 * // ])
 * ```
 */
export function decode9(constructor, t1, t2, t3, t4, t5, t6, t7, t8, t9) {
  return (x) => {
    let $ = t1(x);
    let $1 = t2(x);
    let $2 = t3(x);
    let $3 = t4(x);
    let $4 = t5(x);
    let $5 = t6(x);
    let $6 = t7(x);
    let $7 = t8(x);
    let $8 = t9(x);
    if (
      $ instanceof Ok &&
      $1 instanceof Ok &&
      $2 instanceof Ok &&
      $3 instanceof Ok &&
      $4 instanceof Ok &&
      $5 instanceof Ok &&
      $6 instanceof Ok &&
      $7 instanceof Ok &&
      $8 instanceof Ok
    ) {
      let a = $[0];
      let b = $1[0];
      let c = $2[0];
      let d = $3[0];
      let e = $4[0];
      let f = $5[0];
      let g = $6[0];
      let h = $7[0];
      let i = $8[0];
      return new Ok(constructor(a, b, c, d, e, f, g, h, i));
    } else {
      let a = $;
      let b = $1;
      let c = $2;
      let d = $3;
      let e = $4;
      let f = $5;
      let g = $6;
      let h = $7;
      let i = $8;
      return new Error(
        $list.concat(
          toList([
            all_errors(a),
            all_errors(b),
            all_errors(c),
            all_errors(d),
            all_errors(e),
            all_errors(f),
            all_errors(g),
            all_errors(h),
            all_errors(i),
          ]),
        ),
      );
    }
  };
}
