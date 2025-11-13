import { Ok, Error, toList, Empty as $Empty, prepend as listPrepend, isEqual } from "../gleam.mjs";
import * as $option from "../gleam/option.mjs";
import {
  map_size as size,
  map_to_list as to_list,
  new_map as do_new,
  map_get as do_get,
  map_insert as do_insert,
  map_remove as do_delete,
} from "../gleam_stdlib.mjs";

export { size, to_list };

/**
 * Creates a fresh dict that contains no values.
 */
export function new$() {
  return do_new();
}

/**
 * Fetches a value from a dict for a given key.
 *
 * The dict may not have a value for the key, so the value is wrapped in a
 * `Result`.
 *
 * ## Examples
 *
 * ```gleam
 * new() |> insert("a", 0) |> get("a")
 * // -> Ok(0)
 * ```
 *
 * ```gleam
 * new() |> insert("a", 0) |> get("b")
 * // -> Error(Nil)
 * ```
 */
export function get(from, get) {
  return do_get(from, get);
}

function do_has_key(key, dict) {
  return !isEqual(get(dict, key), new Error(undefined));
}

/**
 * Determines whether or not a value present in the dict for a given key.
 *
 * ## Examples
 *
 * ```gleam
 * new() |> insert("a", 0) |> has_key("a")
 * // -> True
 * ```
 *
 * ```gleam
 * new() |> insert("a", 0) |> has_key("b")
 * // -> False
 * ```
 */
export function has_key(dict, key) {
  return do_has_key(key, dict);
}

/**
 * Inserts a value into the dict with the given key.
 *
 * If the dict already has a value for the given key then the value is
 * replaced with the new value.
 *
 * ## Examples
 *
 * ```gleam
 * new() |> insert("a", 0)
 * // -> from_list([#("a", 0)])
 * ```
 *
 * ```gleam
 * new() |> insert("a", 0) |> insert("a", 5)
 * // -> from_list([#("a", 5)])
 * ```
 */
export function insert(dict, key, value) {
  return do_insert(key, value, dict);
}

function fold_list_of_pair(loop$list, loop$initial) {
  while (true) {
    let list = loop$list;
    let initial = loop$initial;
    if (list instanceof $Empty) {
      return initial;
    } else {
      let x = list.head;
      let rest = list.tail;
      loop$list = rest;
      loop$initial = insert(initial, x[0], x[1]);
    }
  }
}

/**
 * Converts a list of 2-element tuples `#(key, value)` to a dict.
 *
 * If two tuples have the same key the last one in the list will be the one
 * that is present in the dict.
 */
export function from_list(list) {
  return fold_list_of_pair(list, new$());
}

function reverse_and_concat(loop$remaining, loop$accumulator) {
  while (true) {
    let remaining = loop$remaining;
    let accumulator = loop$accumulator;
    if (remaining instanceof $Empty) {
      return accumulator;
    } else {
      let item = remaining.head;
      let rest = remaining.tail;
      loop$remaining = rest;
      loop$accumulator = listPrepend(item, accumulator);
    }
  }
}

function do_keys_acc(loop$list, loop$acc) {
  while (true) {
    let list = loop$list;
    let acc = loop$acc;
    if (list instanceof $Empty) {
      return reverse_and_concat(acc, toList([]));
    } else {
      let x = list.head;
      let xs = list.tail;
      loop$list = xs;
      loop$acc = listPrepend(x[0], acc);
    }
  }
}

function do_keys(dict) {
  let list_of_pairs = to_list(dict);
  return do_keys_acc(list_of_pairs, toList([]));
}

/**
 * Gets a list of all keys in a given dict.
 *
 * Dicts are not ordered so the keys are not returned in any specific order. Do
 * not write code that relies on the order keys are returned by this function
 * as it may change in later versions of Gleam or Erlang.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([#("a", 0), #("b", 1)]) |> keys
 * // -> ["a", "b"]
 * ```
 */
export function keys(dict) {
  return do_keys(dict);
}

function do_values_acc(loop$list, loop$acc) {
  while (true) {
    let list = loop$list;
    let acc = loop$acc;
    if (list instanceof $Empty) {
      return reverse_and_concat(acc, toList([]));
    } else {
      let x = list.head;
      let xs = list.tail;
      loop$list = xs;
      loop$acc = listPrepend(x[1], acc);
    }
  }
}

function do_values(dict) {
  let list_of_pairs = to_list(dict);
  return do_values_acc(list_of_pairs, toList([]));
}

/**
 * Gets a list of all values in a given dict.
 *
 * Dicts are not ordered so the values are not returned in any specific order. Do
 * not write code that relies on the order values are returned by this function
 * as it may change in later versions of Gleam or Erlang.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([#("a", 0), #("b", 1)]) |> values
 * // -> [0, 1]
 * ```
 */
export function values(dict) {
  return do_values(dict);
}

function insert_taken(loop$dict, loop$desired_keys, loop$acc) {
  while (true) {
    let dict = loop$dict;
    let desired_keys = loop$desired_keys;
    let acc = loop$acc;
    let insert$1 = (taken, key) => {
      let $ = get(dict, key);
      if ($ instanceof Ok) {
        let value = $[0];
        return insert(taken, key, value);
      } else {
        return taken;
      }
    };
    if (desired_keys instanceof $Empty) {
      return acc;
    } else {
      let x = desired_keys.head;
      let xs = desired_keys.tail;
      loop$dict = dict;
      loop$desired_keys = xs;
      loop$acc = insert$1(acc, x);
    }
  }
}

function do_take(desired_keys, dict) {
  return insert_taken(dict, desired_keys, new$());
}

/**
 * Creates a new dict from a given dict, only including any entries for which the
 * keys are in a given list.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([#("a", 0), #("b", 1)])
 * |> take(["b"])
 * // -> from_list([#("b", 1)])
 * ```
 *
 * ```gleam
 * from_list([#("a", 0), #("b", 1)])
 * |> take(["a", "b", "c"])
 * // -> from_list([#("a", 0), #("b", 1)])
 * ```
 */
export function take(dict, desired_keys) {
  return do_take(desired_keys, dict);
}

function insert_pair(dict, pair) {
  return insert(dict, pair[0], pair[1]);
}

function fold_inserts(loop$new_entries, loop$dict) {
  while (true) {
    let new_entries = loop$new_entries;
    let dict = loop$dict;
    if (new_entries instanceof $Empty) {
      return dict;
    } else {
      let x = new_entries.head;
      let xs = new_entries.tail;
      loop$new_entries = xs;
      loop$dict = insert_pair(dict, x);
    }
  }
}

function do_merge(dict, new_entries) {
  let _pipe = new_entries;
  let _pipe$1 = to_list(_pipe);
  return fold_inserts(_pipe$1, dict);
}

/**
 * Creates a new dict from a pair of given dicts by combining their entries.
 *
 * If there are entries with the same keys in both dicts the entry from the
 * second dict takes precedence.
 *
 * ## Examples
 *
 * ```gleam
 * let a = from_list([#("a", 0), #("b", 1)])
 * let b = from_list([#("b", 2), #("c", 3)])
 * merge(a, b)
 * // -> from_list([#("a", 0), #("b", 2), #("c", 3)])
 * ```
 */
export function merge(dict, new_entries) {
  return do_merge(dict, new_entries);
}

/**
 * Creates a new dict from a given dict with all the same entries except for the
 * one with a given key, if it exists.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([#("a", 0), #("b", 1)]) |> delete("a")
 * // -> from_list([#("b", 1)])
 * ```
 *
 * ```gleam
 * from_list([#("a", 0), #("b", 1)]) |> delete("c")
 * // -> from_list([#("a", 0), #("b", 1)])
 * ```
 */
export function delete$(dict, key) {
  return do_delete(key, dict);
}

/**
 * Creates a new dict from a given dict with all the same entries except any with
 * keys found in a given list.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([#("a", 0), #("b", 1)]) |> drop(["a"])
 * // -> from_list([#("b", 2)])
 * ```
 *
 * ```gleam
 * from_list([#("a", 0), #("b", 1)]) |> drop(["c"])
 * // -> from_list([#("a", 0), #("b", 1)])
 * ```
 *
 * ```gleam
 * from_list([#("a", 0), #("b", 1)]) |> drop(["a", "b", "c"])
 * // -> from_list([])
 * ```
 */
export function drop(loop$dict, loop$disallowed_keys) {
  while (true) {
    let dict = loop$dict;
    let disallowed_keys = loop$disallowed_keys;
    if (disallowed_keys instanceof $Empty) {
      return dict;
    } else {
      let x = disallowed_keys.head;
      let xs = disallowed_keys.tail;
      loop$dict = delete$(dict, x);
      loop$disallowed_keys = xs;
    }
  }
}

/**
 * Creates a new dict with one entry updated using a given function.
 *
 * If there was not an entry in the dict for the given key then the function
 * gets `None` as its argument, otherwise it gets `Some(value)`.
 *
 * ## Example
 *
 * ```gleam
 * let dict = from_list([#("a", 0)])
 * let increment = fn(x) {
 *   case x {
 *     Some(i) -> i + 1
 *     None -> 0
 *   }
 * }
 *
 * update(dict, "a", increment)
 * // -> from_list([#("a", 1)])
 *
 * update(dict, "b", increment)
 * // -> from_list([#("a", 0), #("b", 0)])
 * ```
 */
export function update(dict, key, fun) {
  let _pipe = dict;
  let _pipe$1 = get(_pipe, key);
  let _pipe$2 = $option.from_result(_pipe$1);
  let _pipe$3 = fun(_pipe$2);
  return ((_capture) => { return insert(dict, key, _capture); })(_pipe$3);
}

function do_fold(loop$list, loop$initial, loop$fun) {
  while (true) {
    let list = loop$list;
    let initial = loop$initial;
    let fun = loop$fun;
    if (list instanceof $Empty) {
      return initial;
    } else {
      let rest = list.tail;
      let k = list.head[0];
      let v = list.head[1];
      loop$list = rest;
      loop$initial = fun(initial, k, v);
      loop$fun = fun;
    }
  }
}

/**
 * Combines all entries into a single value by calling a given function on each
 * one.
 *
 * Dicts are not ordered so the values are not returned in any specific order. Do
 * not write code that relies on the order entries are used by this function
 * as it may change in later versions of Gleam or Erlang.
 *
 * # Examples
 *
 * ```gleam
 * let dict = from_list([#("a", 1), #("b", 3), #("c", 9)])
 * fold(dict, 0, fn(accumulator, key, value) { accumulator + value })
 * // -> 13
 * ```
 *
 * ```gleam
 * import gleam/string
 *
 * let dict = from_list([#("a", 1), #("b", 3), #("c", 9)])
 * fold(dict, "", fn(accumulator, key, value) {
 *   string.append(accumulator, key)
 * })
 * // -> "abc"
 * ```
 */
export function fold(dict, initial, fun) {
  let _pipe = dict;
  let _pipe$1 = to_list(_pipe);
  return do_fold(_pipe$1, initial, fun);
}

function do_map_values(f, dict) {
  let f$1 = (dict, k, v) => { return insert(dict, k, f(k, v)); };
  let _pipe = dict;
  return fold(_pipe, new$(), f$1);
}

/**
 * Updates all values in a given dict by calling a given function on each key
 * and value.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([#(3, 3), #(2, 4)])
 * |> map_values(fn(key, value) { key * value })
 * // -> from_list([#(3, 9), #(2, 8)])
 * ```
 */
export function map_values(dict, fun) {
  return do_map_values(fun, dict);
}

function do_filter(f, dict) {
  let insert$1 = (dict, k, v) => {
    let $ = f(k, v);
    if ($) {
      return insert(dict, k, v);
    } else {
      return dict;
    }
  };
  let _pipe = dict;
  return fold(_pipe, new$(), insert$1);
}

/**
 * Creates a new dict from a given dict, minus any entries that a given function
 * returns `False` for.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([#("a", 0), #("b", 1)])
 * |> filter(fn(key, value) { value != 0 })
 * // -> from_list([#("b", 1)])
 * ```
 *
 * ```gleam
 * from_list([#("a", 0), #("b", 1)])
 * |> filter(fn(key, value) { True })
 * // -> from_list([#("a", 0), #("b", 1)])
 * ```
 */
export function filter(dict, predicate) {
  return do_filter(predicate, dict);
}

/**
 * Calls a function for each key and value in a dict, discarding the return
 * value.
 *
 * Useful for producing a side effect for every item of a dict.
 *
 * ```gleam
 * import gleam/io
 *
 * let dict = from_list([#("a", "apple"), #("b", "banana"), #("c", "cherry")])
 *
 * each(dict, fn(key, value) {
 *   io.println(key <> " => " <> value)
 * })
 * // -> Nil
 * // a => apple
 * // b => banana
 * // c => cherry
 * ```
 *
 * The order of elements in the iteration is an implementation detail that
 * should not be relied upon.
 */
export function each(dict, fun) {
  return fold(
    dict,
    undefined,
    (nil, k, v) => {
      fun(k, v);
      return nil;
    },
  );
}

/**
 * Creates a new dict from a pair of given dicts by combining their entries.
 *
 * If there are entries with the same keys in both dicts the given function is
 * used to determine the new value to use in the resulting dict.
 *
 * ## Examples
 *
 * ```gleam
 * let a = from_list([#("a", 0), #("b", 1)])
 * let b = from_list([#("a", 2), #("c", 3)])
 * combine(a, b, fn(one, other) { one + other })
 * // -> from_list([#("a", 2), #("b", 1), #("c", 3)])
 * ```
 */
export function combine(dict, other, fun) {
  return fold(
    dict,
    other,
    (acc, key, value) => {
      let $ = get(acc, key);
      if ($ instanceof Ok) {
        let other_value = $[0];
        return insert(acc, key, fun(value, other_value));
      } else {
        return insert(acc, key, value);
      }
    },
  );
}
