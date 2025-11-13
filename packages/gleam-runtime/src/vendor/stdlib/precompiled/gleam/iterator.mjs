import {
  Ok,
  Error,
  toList,
  Empty as $Empty,
  prepend as listPrepend,
  CustomType as $CustomType,
  isEqual,
} from "../gleam.mjs";
import * as $dict from "../gleam/dict.mjs";
import * as $int from "../gleam/int.mjs";
import * as $list from "../gleam/list.mjs";
import * as $option from "../gleam/option.mjs";
import { None, Some } from "../gleam/option.mjs";
import * as $order from "../gleam/order.mjs";
import * as $result from "../gleam/result.mjs";

class Stop extends $CustomType {}

class Continue extends $CustomType {
  constructor($0, $1) {
    super();
    this[0] = $0;
    this[1] = $1;
  }
}

class Iterator extends $CustomType {
  constructor(continuation) {
    super();
    this.continuation = continuation;
  }
}

export class Next extends $CustomType {
  constructor(element, accumulator) {
    super();
    this.element = element;
    this.accumulator = accumulator;
  }
}
export const Step$Next = (element, accumulator) =>
  new Next(element, accumulator);
export const Step$isNext = (value) => value instanceof Next;
export const Step$Next$element = (value) => value.element;
export const Step$Next$0 = (value) => value.element;
export const Step$Next$accumulator = (value) => value.accumulator;
export const Step$Next$1 = (value) => value.accumulator;

export class Done extends $CustomType {}
export const Step$Done = () => new Done();
export const Step$isDone = (value) => value instanceof Done;

class AnotherBy extends $CustomType {
  constructor($0, $1, $2, $3) {
    super();
    this[0] = $0;
    this[1] = $1;
    this[2] = $2;
    this[3] = $3;
  }
}

class LastBy extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}

class Another extends $CustomType {
  constructor($0, $1) {
    super();
    this[0] = $0;
    this[1] = $1;
  }
}

class Last extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}

class NoMore extends $CustomType {}

function stop() {
  return new Stop();
}

function do_unfold(initial, f) {
  return () => {
    let $ = f(initial);
    if ($ instanceof Next) {
      let x = $.element;
      let acc = $.accumulator;
      return new Continue(x, do_unfold(acc, f));
    } else {
      return new Stop();
    }
  };
}

/**
 * Creates an iterator from a given function and accumulator.
 *
 * The function is called on the accumulator and returns either `Done`,
 * indicating the iterator has no more elements, or `Next` which contains a
 * new element and accumulator. The element is yielded by the iterator and the
 * new accumulator is used with the function to compute the next element in
 * the sequence.
 *
 * ## Examples
 *
 * ```gleam
 * unfold(from: 5, with: fn(n) {
 *  case n {
 *    0 -> Done
 *    n -> Next(element: n, accumulator: n - 1)
 *  }
 * })
 * |> to_list
 * // -> [5, 4, 3, 2, 1]
 * ```
 */
export function unfold(initial, f) {
  let _pipe = initial;
  let _pipe$1 = do_unfold(_pipe, f);
  return new Iterator(_pipe$1);
}

/**
 * Creates an iterator that yields values created by calling a given function
 * repeatedly.
 */
export function repeatedly(f) {
  return unfold(undefined, (_) => { return new Next(f(), undefined); });
}

/**
 * Creates an iterator that returns the same value infinitely.
 *
 * ## Examples
 *
 * ```gleam
 * repeat(10)
 * |> take(4)
 * |> to_list
 * // -> [10, 10, 10, 10]
 * ```
 */
export function repeat(x) {
  return repeatedly(() => { return x; });
}

/**
 * Creates an iterator that yields each element from the given list.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3, 4])
 * |> to_list
 * // -> [1, 2, 3, 4]
 * ```
 */
export function from_list(list) {
  let yield$1 = (acc) => {
    if (acc instanceof $Empty) {
      return new Done();
    } else {
      let head = acc.head;
      let tail = acc.tail;
      return new Next(head, tail);
    }
  };
  return unfold(list, yield$1);
}

function do_transform(continuation, state, f) {
  return () => {
    let $ = continuation();
    if ($ instanceof Stop) {
      return $;
    } else {
      let el = $[0];
      let next = $[1];
      let $1 = f(state, el);
      if ($1 instanceof Next) {
        let yield$1 = $1.element;
        let next_state = $1.accumulator;
        return new Continue(yield$1, do_transform(next, next_state, f));
      } else {
        return new Stop();
      }
    }
  };
}

/**
 * Creates an iterator from an existing iterator
 * and a stateful function that may short-circuit.
 *
 * `f` takes arguments `acc` for current state and `el` for current element from underlying iterator,
 * and returns either `Next` with yielded element and new state value, or `Done` to halt the iterator.
 *
 * ## Examples
 *
 * Approximate implementation of `index` in terms of `transform`:
 *
 * ```gleam
 * from_list(["a", "b", "c"])
 * |> transform(0, fn(i, el) { Next(#(i, el), i + 1) })
 * |> to_list
 * // -> [#(0, "a"), #(1, "b"), #(2, "c")]
 * ```
 */
export function transform(iterator, initial, f) {
  let _pipe = do_transform(iterator.continuation, initial, f);
  return new Iterator(_pipe);
}

function do_fold(loop$continuation, loop$f, loop$accumulator) {
  while (true) {
    let continuation = loop$continuation;
    let f = loop$f;
    let accumulator = loop$accumulator;
    let $ = continuation();
    if ($ instanceof Stop) {
      return accumulator;
    } else {
      let elem = $[0];
      let next = $[1];
      loop$continuation = next;
      loop$f = f;
      loop$accumulator = f(accumulator, elem);
    }
  }
}

/**
 * Reduces an iterator of elements into a single value by calling a given
 * function on each element in turn.
 *
 * If called on an iterator of infinite length then this function will never
 * return.
 *
 * If you do not care about the end value and only wish to evaluate the
 * iterator for side effects consider using the `run` function instead.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3, 4])
 * |> fold(from: 0, with: fn(acc, element) { element + acc })
 * // -> 10
 * ```
 */
export function fold(iterator, initial, f) {
  let _pipe = iterator.continuation;
  return do_fold(_pipe, f, initial);
}

/**
 * Evaluates all elements emitted by the given iterator. This function is useful for when
 * you wish to trigger any side effects that would occur when evaluating
 * the iterator.
 */
export function run(iterator) {
  return fold(iterator, undefined, (_, _1) => { return undefined; });
}

/**
 * Evaluates an iterator and returns all the elements as a list.
 *
 * If called on an iterator of infinite length then this function will never
 * return.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3])
 * |> map(fn(x) { x * 2 })
 * |> to_list
 * // -> [2, 4, 6]
 * ```
 */
export function to_list(iterator) {
  let _pipe = iterator;
  let _pipe$1 = fold(
    _pipe,
    toList([]),
    (acc, e) => { return listPrepend(e, acc); },
  );
  return $list.reverse(_pipe$1);
}

/**
 * Eagerly accesses the first value of an iterator, returning a `Next`
 * that contains the first value and the rest of the iterator.
 *
 * If called on an empty iterator, `Done` is returned.
 *
 * ## Examples
 *
 * ```gleam
 * let assert Next(first, rest) = from_list([1, 2, 3, 4]) |> step
 *
 * first
 * // -> 1
 *
 * rest |> to_list
 * // -> [2, 3, 4]
 * ```
 *
 * ```gleam
 * empty() |> step
 * // -> Done
 * ```
 */
export function step(iterator) {
  let $ = iterator.continuation();
  if ($ instanceof Stop) {
    return new Done();
  } else {
    let e = $[0];
    let a = $[1];
    return new Next(e, new Iterator(a));
  }
}

function do_take(continuation, desired) {
  return () => {
    let $ = desired > 0;
    if ($) {
      let $1 = continuation();
      if ($1 instanceof Stop) {
        return $1;
      } else {
        let e = $1[0];
        let next = $1[1];
        return new Continue(e, do_take(next, desired - 1));
      }
    } else {
      return new Stop();
    }
  };
}

/**
 * Creates an iterator that only yields the first `desired` elements.
 *
 * If the iterator does not have enough elements all of them are yielded.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3, 4, 5])
 * |> take(up_to: 3)
 * |> to_list
 * // -> [1, 2, 3]
 * ```
 *
 * ```gleam
 * from_list([1, 2])
 * |> take(up_to: 3)
 * |> to_list
 * // -> [1, 2]
 * ```
 */
export function take(iterator, desired) {
  let _pipe = iterator.continuation;
  let _pipe$1 = do_take(_pipe, desired);
  return new Iterator(_pipe$1);
}

function do_drop(loop$continuation, loop$desired) {
  while (true) {
    let continuation = loop$continuation;
    let desired = loop$desired;
    let $ = continuation();
    if ($ instanceof Stop) {
      return $;
    } else {
      let e = $[0];
      let next = $[1];
      let $1 = desired > 0;
      if ($1) {
        loop$continuation = next;
        loop$desired = desired - 1;
      } else {
        return new Continue(e, next);
      }
    }
  }
}

/**
 * Evaluates and discards the first N elements in an iterator, returning a new
 * iterator.
 *
 * If the iterator does not have enough elements an empty iterator is
 * returned.
 *
 * This function does not evaluate the elements of the iterator, the
 * computation is performed when the iterator is later run.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3, 4, 5])
 * |> drop(up_to: 3)
 * |> to_list
 * // -> [4, 5]
 * ```
 *
 * ```gleam
 * from_list([1, 2])
 * |> drop(up_to: 3)
 * |> to_list
 * // -> []
 * ```
 */
export function drop(iterator, desired) {
  let _pipe = () => { return do_drop(iterator.continuation, desired); };
  return new Iterator(_pipe);
}

function do_map(continuation, f) {
  return () => {
    let $ = continuation();
    if ($ instanceof Stop) {
      return $;
    } else {
      let e = $[0];
      let continuation$1 = $[1];
      return new Continue(f(e), do_map(continuation$1, f));
    }
  };
}

/**
 * Creates an iterator from an existing iterator and a transformation function.
 *
 * Each element in the new iterator will be the result of calling the given
 * function on the elements in the given iterator.
 *
 * This function does not evaluate the elements of the iterator, the
 * computation is performed when the iterator is later run.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3])
 * |> map(fn(x) { x * 2 })
 * |> to_list
 * // -> [2, 4, 6]
 * ```
 */
export function map(iterator, f) {
  let _pipe = iterator.continuation;
  let _pipe$1 = do_map(_pipe, f);
  return new Iterator(_pipe$1);
}

function do_map2(continuation1, continuation2, fun) {
  return () => {
    let $ = continuation1();
    if ($ instanceof Stop) {
      return $;
    } else {
      let a = $[0];
      let next_a = $[1];
      let $1 = continuation2();
      if ($1 instanceof Stop) {
        return $1;
      } else {
        let b = $1[0];
        let next_b = $1[1];
        return new Continue(fun(a, b), do_map2(next_a, next_b, fun));
      }
    }
  };
}

/**
 * Combines two iterators into a single one using the given function.
 *
 * If an iterator is longer than the other the extra elements are dropped.
 *
 * This function does not evaluate the elements of the two iterators, the
 * computation is performed when the resulting iterator is later run.
 *
 * ## Examples
 *
 * ```gleam
 * let first = from_list([1, 2, 3])
 * let second = from_list([4, 5, 6])
 * map2(first, second, fn(x, y) { x + y }) |> to_list
 * // -> [5, 7, 9]
 * ```
 *
 * ```gleam
 * let first = from_list([1, 2])
 * let second = from_list(["a", "b", "c"])
 * map2(first, second, fn(i, x) { #(i, x) }) |> to_list
 * // -> [#(1, "a"), #(2, "b")]
 * ```
 */
export function map2(iterator1, iterator2, fun) {
  let _pipe = do_map2(iterator1.continuation, iterator2.continuation, fun);
  return new Iterator(_pipe);
}

function do_append(first, second) {
  let $ = first();
  if ($ instanceof Stop) {
    return second();
  } else {
    let e = $[0];
    let first$1 = $[1];
    return new Continue(e, () => { return do_append(first$1, second); });
  }
}

/**
 * Appends two iterators, producing a new iterator.
 *
 * This function does not evaluate the elements of the iterators, the
 * computation is performed when the resulting iterator is later run.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2])
 * |> append(from_list([3, 4]))
 * |> to_list
 * // -> [1, 2, 3, 4]
 * ```
 */
export function append(first, second) {
  let _pipe = () => {
    return do_append(first.continuation, second.continuation);
  };
  return new Iterator(_pipe);
}

function do_flatten(flattened) {
  let $ = flattened();
  if ($ instanceof Stop) {
    return $;
  } else {
    let it = $[0];
    let next_iterator = $[1];
    return do_append(
      it.continuation,
      () => { return do_flatten(next_iterator); },
    );
  }
}

/**
 * Flattens an iterator of iterators, creating a new iterator.
 *
 * This function does not evaluate the elements of the iterator, the
 * computation is performed when the iterator is later run.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([[1, 2], [3, 4]])
 * |> map(from_list)
 * |> flatten
 * |> to_list
 * // -> [1, 2, 3, 4]
 * ```
 */
export function flatten(iterator) {
  let _pipe = () => { return do_flatten(iterator.continuation); };
  return new Iterator(_pipe);
}

/**
 * Joins a list of iterators into a single iterator.
 *
 * This function does not evaluate the elements of the iterator, the
 * computation is performed when the iterator is later run.
 *
 * ## Examples
 *
 * ```gleam
 * [[1, 2], [3, 4]]
 * |> map(from_list)
 * |> concat
 * |> to_list
 * // -> [1, 2, 3, 4]
 * ```
 */
export function concat(iterators) {
  return flatten(from_list(iterators));
}

/**
 * Creates an iterator from an existing iterator and a transformation function.
 *
 * Each element in the new iterator will be the result of calling the given
 * function on the elements in the given iterator and then flattening the
 * results.
 *
 * This function does not evaluate the elements of the iterator, the
 * computation is performed when the iterator is later run.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2])
 * |> flat_map(fn(x) { from_list([x, x + 1]) })
 * |> to_list
 * // -> [1, 2, 2, 3]
 * ```
 */
export function flat_map(iterator, f) {
  let _pipe = iterator;
  let _pipe$1 = map(_pipe, f);
  return flatten(_pipe$1);
}

function do_filter(loop$continuation, loop$predicate) {
  while (true) {
    let continuation = loop$continuation;
    let predicate = loop$predicate;
    let $ = continuation();
    if ($ instanceof Stop) {
      return $;
    } else {
      let e = $[0];
      let iterator = $[1];
      let $1 = predicate(e);
      if ($1) {
        return new Continue(e, () => { return do_filter(iterator, predicate); });
      } else {
        loop$continuation = iterator;
        loop$predicate = predicate;
      }
    }
  }
}

/**
 * Creates an iterator from an existing iterator and a predicate function.
 *
 * The new iterator will contain elements from the first iterator for which
 * the given function returns `True`.
 *
 * This function does not evaluate the elements of the iterator, the
 * computation is performed when the iterator is later run.
 *
 * ## Examples
 *
 * ```gleam
 * import gleam/int
 *
 * from_list([1, 2, 3, 4])
 * |> filter(int.is_even)
 * |> to_list
 * // -> [2, 4]
 * ```
 */
export function filter(iterator, predicate) {
  let _pipe = () => { return do_filter(iterator.continuation, predicate); };
  return new Iterator(_pipe);
}

function do_filter_map(loop$continuation, loop$f) {
  while (true) {
    let continuation = loop$continuation;
    let f = loop$f;
    let $ = continuation();
    if ($ instanceof Stop) {
      return $;
    } else {
      let e = $[0];
      let next = $[1];
      let $1 = f(e);
      if ($1 instanceof Ok) {
        let e$1 = $1[0];
        return new Continue(e$1, () => { return do_filter_map(next, f); });
      } else {
        loop$continuation = next;
        loop$f = f;
      }
    }
  }
}

/**
 * Creates an iterator from an existing iterator and a transforming predicate function.
 *
 * The new iterator will contain elements from the first iterator for which
 * the given function returns `Ok`, transformed to the value inside the `Ok`.
 *
 * This function does not evaluate the elements of the iterator, the
 * computation is performed when the iterator is later run.
 *
 * ## Examples
 *
 * ```gleam
 * import gleam/string
 * import gleam/int
 *
 * "a1b2c3d4e5f"
 * |> string.to_graphemes
 * |> from_list
 * |> filter_map(int.parse)
 * |> to_list
 * // -> [1, 2, 3, 4, 5]
 * ```
 */
export function filter_map(iterator, f) {
  let _pipe = () => { return do_filter_map(iterator.continuation, f); };
  return new Iterator(_pipe);
}

/**
 * Creates an iterator that repeats a given iterator infinitely.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2])
 * |> cycle
 * |> take(6)
 * |> to_list
 * // -> [1, 2, 1, 2, 1, 2]
 * ```
 */
export function cycle(iterator) {
  let _pipe = repeat(iterator);
  return flatten(_pipe);
}

function do_find(loop$continuation, loop$f) {
  while (true) {
    let continuation = loop$continuation;
    let f = loop$f;
    let $ = continuation();
    if ($ instanceof Stop) {
      return new Error(undefined);
    } else {
      let e = $[0];
      let next = $[1];
      let $1 = f(e);
      if ($1) {
        return new Ok(e);
      } else {
        loop$continuation = next;
        loop$f = f;
      }
    }
  }
}

/**
 * Finds the first element in a given iterator for which the given function returns
 * `True`.
 *
 * Returns `Error(Nil)` if the function does not return `True` for any of the
 * elements.
 *
 * ## Examples
 *
 * ```gleam
 * find(from_list([1, 2, 3]), fn(x) { x > 2 })
 * // -> Ok(3)
 * ```
 *
 * ```gleam
 * find(from_list([1, 2, 3]), fn(x) { x > 4 })
 * // -> Error(Nil)
 * ```
 *
 * ```gleam
 * find(empty(), fn(_) { True })
 * // -> Error(Nil)
 * ```
 */
export function find(haystack, is_desired) {
  let _pipe = haystack.continuation;
  return do_find(_pipe, is_desired);
}

function do_find_map(loop$continuation, loop$f) {
  while (true) {
    let continuation = loop$continuation;
    let f = loop$f;
    let $ = continuation();
    if ($ instanceof Stop) {
      return new Error(undefined);
    } else {
      let e = $[0];
      let next = $[1];
      let $1 = f(e);
      if ($1 instanceof Ok) {
        return $1;
      } else {
        loop$continuation = next;
        loop$f = f;
      }
    }
  }
}

/**
 * Finds the first element in a given iterator
 * for which the given function returns `Ok(new_value)`,
 * then returns the wrapped `new_value`.
 *
 * Returns `Error(Nil)` if no such element is found.
 *
 * ## Examples
 *
 * ```gleam
 * find_map(from_list([1, 2, 3]), first)
 * // -> Ok(1)
 * ```
 *
 * ```gleam
 * find_map(from_list([]), first)
 * // -> Error(Nil)
 * ```
 *
 * ```gleam
 * find(empty(), first)
 * // -> Error(Nil)
 * ```
 */
export function find_map(haystack, is_desired) {
  let _pipe = haystack.continuation;
  return do_find_map(_pipe, is_desired);
}

function do_index(continuation, next) {
  return () => {
    let $ = continuation();
    if ($ instanceof Stop) {
      return $;
    } else {
      let e = $[0];
      let continuation$1 = $[1];
      return new Continue([e, next], do_index(continuation$1, next + 1));
    }
  };
}

/**
 * Wraps values yielded from an iterator with indices, starting from 0.
 *
 * ## Examples
 *
 * ```gleam
 * from_list(["a", "b", "c"]) |> index |> to_list
 * // -> [#("a", 0), #("b", 1), #("c", 2)]
 * ```
 */
export function index(iterator) {
  let _pipe = iterator.continuation;
  let _pipe$1 = do_index(_pipe, 0);
  return new Iterator(_pipe$1);
}

/**
 * Creates an iterator that infinitely applies a function to a value.
 *
 * ## Examples
 *
 * ```gleam
 * iterate(1, fn(n) { n * 3 }) |> take(5) |> to_list
 * // -> [1, 3, 9, 27, 81]
 * ```
 */
export function iterate(initial, f) {
  return unfold(initial, (element) => { return new Next(element, f(element)); });
}

function do_take_while(continuation, predicate) {
  return () => {
    let $ = continuation();
    if ($ instanceof Stop) {
      return $;
    } else {
      let e = $[0];
      let next = $[1];
      let $1 = predicate(e);
      if ($1) {
        return new Continue(e, do_take_while(next, predicate));
      } else {
        return new Stop();
      }
    }
  };
}

/**
 * Creates an iterator that yields elements while the predicate returns `True`.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3, 2, 4])
 * |> take_while(satisfying: fn(x) { x < 3 })
 * |> to_list
 * // -> [1, 2]
 * ```
 */
export function take_while(iterator, predicate) {
  let _pipe = iterator.continuation;
  let _pipe$1 = do_take_while(_pipe, predicate);
  return new Iterator(_pipe$1);
}

function do_drop_while(loop$continuation, loop$predicate) {
  while (true) {
    let continuation = loop$continuation;
    let predicate = loop$predicate;
    let $ = continuation();
    if ($ instanceof Stop) {
      return $;
    } else {
      let e = $[0];
      let next = $[1];
      let $1 = predicate(e);
      if ($1) {
        loop$continuation = next;
        loop$predicate = predicate;
      } else {
        return new Continue(e, next);
      }
    }
  }
}

/**
 * Creates an iterator that drops elements while the predicate returns `True`,
 * and then yields the remaining elements.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3, 4, 2, 5])
 * |> drop_while(satisfying: fn(x) { x < 4 })
 * |> to_list
 * // -> [4, 2, 5]
 * ```
 */
export function drop_while(iterator, predicate) {
  let _pipe = () => { return do_drop_while(iterator.continuation, predicate); };
  return new Iterator(_pipe);
}

function do_scan(continuation, f, accumulator) {
  return () => {
    let $ = continuation();
    if ($ instanceof Stop) {
      return $;
    } else {
      let el = $[0];
      let next = $[1];
      let accumulated = f(accumulator, el);
      return new Continue(accumulated, do_scan(next, f, accumulated));
    }
  };
}

/**
 * Creates an iterator from an existing iterator and a stateful function.
 *
 * Specifically, this behaves like `fold`, but yields intermediate results.
 *
 * ## Examples
 *
 * ```gleam
 * // Generate a sequence of partial sums
 * from_list([1, 2, 3, 4, 5])
 * |> scan(from: 0, with: fn(acc, el) { acc + el })
 * |> to_list
 * // -> [1, 3, 6, 10, 15]
 * ```
 */
export function scan(iterator, initial, f) {
  let _pipe = iterator.continuation;
  let _pipe$1 = do_scan(_pipe, f, initial);
  return new Iterator(_pipe$1);
}

function do_zip(left, right) {
  return () => {
    let $ = left();
    if ($ instanceof Stop) {
      return $;
    } else {
      let el_left = $[0];
      let next_left = $[1];
      let $1 = right();
      if ($1 instanceof Stop) {
        return $1;
      } else {
        let el_right = $1[0];
        let next_right = $1[1];
        return new Continue([el_left, el_right], do_zip(next_left, next_right));
      }
    }
  };
}

/**
 * Zips two iterators together, emitting values from both
 * until the shorter one runs out.
 *
 * ## Examples
 *
 * ```gleam
 * from_list(["a", "b", "c"])
 * |> zip(range(20, 30))
 * |> to_list
 * // -> [#("a", 20), #("b", 21), #("c", 22)]
 * ```
 */
export function zip(left, right) {
  let _pipe = do_zip(left.continuation, right.continuation);
  return new Iterator(_pipe);
}

function next_chunk(
  loop$continuation,
  loop$f,
  loop$previous_key,
  loop$current_chunk
) {
  while (true) {
    let continuation = loop$continuation;
    let f = loop$f;
    let previous_key = loop$previous_key;
    let current_chunk = loop$current_chunk;
    let $ = continuation();
    if ($ instanceof Stop) {
      return new LastBy($list.reverse(current_chunk));
    } else {
      let e = $[0];
      let next = $[1];
      let key = f(e);
      let $1 = isEqual(key, previous_key);
      if ($1) {
        loop$continuation = next;
        loop$f = f;
        loop$previous_key = key;
        loop$current_chunk = listPrepend(e, current_chunk);
      } else {
        return new AnotherBy($list.reverse(current_chunk), key, e, next);
      }
    }
  }
}

function do_chunk(continuation, f, previous_key, previous_element) {
  let $ = next_chunk(continuation, f, previous_key, toList([previous_element]));
  if ($ instanceof AnotherBy) {
    let chunk$1 = $[0];
    let key = $[1];
    let el = $[2];
    let next = $[3];
    return new Continue(chunk$1, () => { return do_chunk(next, f, key, el); });
  } else {
    let chunk$1 = $[0];
    return new Continue(chunk$1, stop);
  }
}

/**
 * Creates an iterator that emits chunks of elements
 * for which `f` returns the same value.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 2, 3, 4, 4, 6, 7, 7])
 * |> chunk(by: fn(n) { n % 2 })
 * |> to_list
 * // -> [[1], [2, 2], [3], [4, 4, 6], [7, 7]]
 * ```
 */
export function chunk(iterator, f) {
  let _pipe = () => {
    let $ = iterator.continuation();
    if ($ instanceof Stop) {
      return $;
    } else {
      let e = $[0];
      let next = $[1];
      return do_chunk(next, f, f(e), e);
    }
  };
  return new Iterator(_pipe);
}

function next_sized_chunk(loop$continuation, loop$left, loop$current_chunk) {
  while (true) {
    let continuation = loop$continuation;
    let left = loop$left;
    let current_chunk = loop$current_chunk;
    let $ = continuation();
    if ($ instanceof Stop) {
      if (current_chunk instanceof $Empty) {
        return new NoMore();
      } else {
        let remaining = current_chunk;
        return new Last($list.reverse(remaining));
      }
    } else {
      let e = $[0];
      let next = $[1];
      let chunk$1 = listPrepend(e, current_chunk);
      let $1 = left > 1;
      if ($1) {
        loop$continuation = next;
        loop$left = left - 1;
        loop$current_chunk = chunk$1;
      } else {
        return new Another($list.reverse(chunk$1), next);
      }
    }
  }
}

function do_sized_chunk(continuation, count) {
  return () => {
    let $ = next_sized_chunk(continuation, count, toList([]));
    if ($ instanceof Another) {
      let chunk$1 = $[0];
      let next_element = $[1];
      return new Continue(chunk$1, do_sized_chunk(next_element, count));
    } else if ($ instanceof Last) {
      let chunk$1 = $[0];
      return new Continue(chunk$1, stop);
    } else {
      return new Stop();
    }
  };
}

/**
 * Creates an iterator that emits chunks of given size.
 *
 * If the last chunk does not have `count` elements, it is yielded
 * as a partial chunk, with less than `count` elements.
 *
 * For any `count` less than 1 this function behaves as if it was set to 1.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3, 4, 5, 6])
 * |> sized_chunk(into: 2)
 * |> to_list
 * // -> [[1, 2], [3, 4], [5, 6]]
 * ```
 *
 * ```gleam
 * from_list([1, 2, 3, 4, 5, 6, 7, 8])
 * |> sized_chunk(into: 3)
 * |> to_list
 * // -> [[1, 2, 3], [4, 5, 6], [7, 8]]
 * ```
 */
export function sized_chunk(iterator, count) {
  let _pipe = iterator.continuation;
  let _pipe$1 = do_sized_chunk(_pipe, count);
  return new Iterator(_pipe$1);
}

function do_intersperse(continuation, separator) {
  let $ = continuation();
  if ($ instanceof Stop) {
    return $;
  } else {
    let e = $[0];
    let next = $[1];
    let next_interspersed = () => { return do_intersperse(next, separator); };
    return new Continue(
      separator,
      () => { return new Continue(e, next_interspersed); },
    );
  }
}

/**
 * Creates an iterator that yields the given `elem` element
 * between elements emitted by the underlying iterator.
 *
 * ## Examples
 *
 * ```gleam
 * empty()
 * |> intersperse(with: 0)
 * |> to_list
 * // -> []
 * ```
 *
 * ```gleam
 * from_list([1])
 * |> intersperse(with: 0)
 * |> to_list
 * // -> [1]
 * ```
 *
 * ```gleam
 * from_list([1, 2, 3, 4, 5])
 * |> intersperse(with: 0)
 * |> to_list
 * // -> [1, 0, 2, 0, 3, 0, 4, 0, 5]
 * ```
 */
export function intersperse(iterator, elem) {
  let _pipe = () => {
    let $ = iterator.continuation();
    if ($ instanceof Stop) {
      return $;
    } else {
      let e = $[0];
      let next = $[1];
      return new Continue(e, () => { return do_intersperse(next, elem); });
    }
  };
  return new Iterator(_pipe);
}

function do_any(loop$continuation, loop$predicate) {
  while (true) {
    let continuation = loop$continuation;
    let predicate = loop$predicate;
    let $ = continuation();
    if ($ instanceof Stop) {
      return false;
    } else {
      let e = $[0];
      let next = $[1];
      let $1 = predicate(e);
      if ($1) {
        return $1;
      } else {
        loop$continuation = next;
        loop$predicate = predicate;
      }
    }
  }
}

/**
 * Returns `True` if any element emitted by the iterator satisfies the given predicate,
 * `False` otherwise.
 *
 * This function short-circuits once it finds a satisfying element.
 *
 * An empty iterator results in `False`.
 *
 * ## Examples
 *
 * ```gleam
 * empty()
 * |> any(fn(n) { n % 2 == 0 })
 * // -> False
 * ```
 *
 * ```gleam
 * from_list([1, 2, 5, 7, 9])
 * |> any(fn(n) { n % 2 == 0 })
 * // -> True
 * ```
 *
 * ```gleam
 * from_list([1, 3, 5, 7, 9])
 * |> any(fn(n) { n % 2 == 0 })
 * // -> False
 * ```
 */
export function any(iterator, predicate) {
  let _pipe = iterator.continuation;
  return do_any(_pipe, predicate);
}

function do_all(loop$continuation, loop$predicate) {
  while (true) {
    let continuation = loop$continuation;
    let predicate = loop$predicate;
    let $ = continuation();
    if ($ instanceof Stop) {
      return true;
    } else {
      let e = $[0];
      let next = $[1];
      let $1 = predicate(e);
      if ($1) {
        loop$continuation = next;
        loop$predicate = predicate;
      } else {
        return $1;
      }
    }
  }
}

/**
 * Returns `True` if all elements emitted by the iterator satisfy the given predicate,
 * `False` otherwise.
 *
 * This function short-circuits once it finds a non-satisfying element.
 *
 * An empty iterator results in `True`.
 *
 * ## Examples
 *
 * ```gleam
 * empty()
 * |> all(fn(n) { n % 2 == 0 })
 * // -> True
 * ```
 *
 * ```gleam
 * from_list([2, 4, 6, 8])
 * |> all(fn(n) { n % 2 == 0 })
 * // -> True
 * ```
 *
 * ```gleam
 * from_list([2, 4, 5, 8])
 * |> all(fn(n) { n % 2 == 0 })
 * // -> False
 * ```
 */
export function all(iterator, predicate) {
  let _pipe = iterator.continuation;
  return do_all(_pipe, predicate);
}

function update_group_with(el) {
  return (maybe_group) => {
    if (maybe_group instanceof Some) {
      let group$1 = maybe_group[0];
      return listPrepend(el, group$1);
    } else {
      return toList([el]);
    }
  };
}

function group_updater(f) {
  return (groups, elem) => {
    let _pipe = groups;
    return $dict.update(_pipe, f(elem), update_group_with(elem));
  };
}

/**
 * Returns a `Dict(k, List(element))` of elements from the given iterator
 * grouped with the given key function.
 *
 * The order within each group is preserved from the iterator.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3, 4, 5, 6])
 * |> group(by: fn(n) { n % 3 })
 * // -> dict.from_list([#(0, [3, 6]), #(1, [1, 4]), #(2, [2, 5])])
 * ```
 */
export function group(iterator, key) {
  let _pipe = iterator;
  let _pipe$1 = fold(_pipe, $dict.new$(), group_updater(key));
  return $dict.map_values(
    _pipe$1,
    (_, group) => { return $list.reverse(group); },
  );
}

/**
 * This function acts similar to fold, but does not take an initial state.
 * Instead, it starts from the first yielded element
 * and combines it with each subsequent element in turn using the given function.
 * The function is called as `f(accumulator, current_element)`.
 *
 * Returns `Ok` to indicate a successful run, and `Error` if called on an empty iterator.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([])
 * |> reduce(fn(acc, x) { acc + x })
 * // -> Error(Nil)
 * ```
 *
 * ```gleam
 * from_list([1, 2, 3, 4, 5])
 * |> reduce(fn(acc, x) { acc + x })
 * // -> Ok(15)
 * ```
 */
export function reduce(iterator, f) {
  let $ = iterator.continuation();
  if ($ instanceof Stop) {
    return new Error(undefined);
  } else {
    let e = $[0];
    let next = $[1];
    let _pipe = do_fold(next, f, e);
    return new Ok(_pipe);
  }
}

/**
 * Returns the last element in the given iterator.
 *
 * Returns `Error(Nil)` if the iterator is empty.
 *
 * This function runs in linear time.
 *
 * ## Examples
 *
 * ```gleam
 * empty() |> last
 * // -> Error(Nil)
 * ```
 *
 * ```gleam
 * range(1, 10) |> last
 * // -> Ok(9)
 * ```
 */
export function last(iterator) {
  let _pipe = iterator;
  return reduce(_pipe, (_, elem) => { return elem; });
}

/**
 * Creates an iterator that yields no elements.
 *
 * ## Examples
 *
 * ```gleam
 * empty() |> to_list
 * // -> []
 * ```
 */
export function empty() {
  return new Iterator(stop);
}

/**
 * Creates an iterator that yields exactly one element provided by calling the given function.
 *
 * ## Examples
 *
 * ```gleam
 * once(fn() { 1 }) |> to_list
 * // -> [1]
 * ```
 */
export function once(f) {
  let _pipe = () => { return new Continue(f(), stop); };
  return new Iterator(_pipe);
}

/**
 * Creates an iterator of ints, starting at a given start int and stepping by
 * one to a given end int.
 *
 * ## Examples
 *
 * ```gleam
 * range(from: 1, to: 5) |> to_list
 * // -> [1, 2, 3, 4, 5]
 * ```
 *
 * ```gleam
 * range(from: 1, to: -2) |> to_list
 * // -> [1, 0, -1, -2]
 * ```
 *
 * ```gleam
 * range(from: 0, to: 0) |> to_list
 * // -> [0]
 * ```
 */
export function range(start, stop) {
  let $ = $int.compare(start, stop);
  if ($ instanceof $order.Lt) {
    return unfold(
      start,
      (current) => {
        let $1 = current > stop;
        if ($1) {
          return new Done();
        } else {
          return new Next(current, current + 1);
        }
      },
    );
  } else if ($ instanceof $order.Eq) {
    return once(() => { return start; });
  } else {
    return unfold(
      start,
      (current) => {
        let $1 = current < stop;
        if ($1) {
          return new Done();
        } else {
          return new Next(current, current - 1);
        }
      },
    );
  }
}

/**
 * Creates an iterator that yields the given element exactly once.
 *
 * ## Examples
 *
 * ```gleam
 * single(1) |> to_list
 * // -> [1]
 * ```
 */
export function single(elem) {
  return once(() => { return elem; });
}

function do_interleave(current, next) {
  let $ = current();
  if ($ instanceof Stop) {
    return next();
  } else {
    let e = $[0];
    let next_other = $[1];
    return new Continue(e, () => { return do_interleave(next, next_other); });
  }
}

/**
 * Creates an iterator that alternates between the two given iterators
 * until both have run out.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3, 4])
 * |> interleave(from_list([11, 12, 13, 14]))
 * |> to_list
 * // -> [1, 11, 2, 12, 3, 13, 4, 14]
 * ```
 *
 * ```gleam
 * from_list([1, 2, 3, 4])
 * |> interleave(from_list([100]))
 * |> to_list
 * // -> [1, 100, 2, 3, 4]
 * ```
 */
export function interleave(left, right) {
  let _pipe = () => {
    return do_interleave(left.continuation, right.continuation);
  };
  return new Iterator(_pipe);
}

function do_fold_until(loop$continuation, loop$f, loop$accumulator) {
  while (true) {
    let continuation = loop$continuation;
    let f = loop$f;
    let accumulator = loop$accumulator;
    let $ = continuation();
    if ($ instanceof Stop) {
      return accumulator;
    } else {
      let elem = $[0];
      let next = $[1];
      let $1 = f(accumulator, elem);
      if ($1 instanceof $list.Continue) {
        let accumulator$1 = $1[0];
        loop$continuation = next;
        loop$f = f;
        loop$accumulator = accumulator$1;
      } else {
        let accumulator$1 = $1[0];
        return accumulator$1;
      }
    }
  }
}

/**
 * Like `fold`, `fold_until` reduces an iterator of elements into a single value by calling a given
 * function on each element in turn, but uses `list.ContinueOrStop` to determine
 * whether or not to keep iterating.
 *
 * If called on an iterator of infinite length then this function will only ever
 * return if the function returns `list.Stop`.
 *
 * ## Examples
 *
 * ```gleam
 * import gleam/list
 *
 * let f = fn(acc, e) {
 *   case e {
 *     _ if e < 4 -> list.Continue(e + acc)
 *     _ -> list.Stop(acc)
 *   }
 * }
 *
 * from_list([1, 2, 3, 4])
 * |> fold_until(from: acc, with: f)
 * // -> 6
 * ```
 */
export function fold_until(iterator, initial, f) {
  let _pipe = iterator.continuation;
  return do_fold_until(_pipe, f, initial);
}

function do_try_fold(continuation, f, accumulator) {
  let $ = continuation();
  if ($ instanceof Stop) {
    return new Ok(accumulator);
  } else {
    let elem = $[0];
    let next = $[1];
    return $result.try$(
      f(accumulator, elem),
      (accumulator) => { return do_try_fold(next, f, accumulator); },
    );
  }
}

/**
 * A variant of fold that might fail.
 *
 * The folding function should return `Result(accumulator, error)`.
 * If the returned value is `Ok(accumulator)` try_fold will try the next value in the iterator.
 * If the returned value is `Error(error)` try_fold will stop and return that error.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3, 4])
 * |> try_fold(0, fn(acc, i) {
 *   case i < 3 {
 *     True -> Ok(acc + i)
 *     False -> Error(Nil)
 *   }
 * })
 * // -> Error(Nil)
 * ```
 */
export function try_fold(iterator, initial, f) {
  let _pipe = iterator.continuation;
  return do_try_fold(_pipe, f, initial);
}

/**
 * Returns the first element yielded by the given iterator, if it exists,
 * or `Error(Nil)` otherwise.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3]) |> first
 * // -> Ok(1)
 * ```
 *
 * ```gleam
 * empty() |> first
 * // -> Error(Nil)
 * ```
 */
export function first(iterator) {
  let $ = iterator.continuation();
  if ($ instanceof Stop) {
    return new Error(undefined);
  } else {
    let e = $[0];
    return new Ok(e);
  }
}

/**
 * Returns nth element yielded by the given iterator, where `0` means the first element.
 *
 * If there are not enough elements in the iterator, `Error(Nil)` is returned.
 *
 * For any `index` less than `0` this function behaves as if it was set to `0`.
 *
 * ## Examples
 *
 * ```gleam
 * from_list([1, 2, 3, 4]) |> at(2)
 * // -> Ok(3)
 * ```
 *
 * ```gleam
 * from_list([1, 2, 3, 4]) |> at(4)
 * // -> Error(Nil)
 * ```
 *
 * ```gleam
 * empty() |> at(0)
 * // -> Error(Nil)
 * ```
 */
export function at(iterator, index) {
  let _pipe = iterator;
  let _pipe$1 = drop(_pipe, index);
  return first(_pipe$1);
}

function do_length(loop$continuation, loop$length) {
  while (true) {
    let continuation = loop$continuation;
    let length = loop$length;
    let $ = continuation();
    if ($ instanceof Stop) {
      return length;
    } else {
      let next = $[1];
      loop$continuation = next;
      loop$length = length + 1;
    }
  }
}

/**
 * Counts the number of elements in the given iterator.
 *
 * This function has to traverse the entire iterator to count its elements,
 * so it runs in linear time.
 *
 * ## Examples
 *
 * ```gleam
 * empty() |> length
 * // -> 0
 * ```
 *
 * ```gleam
 * from_list([1, 2, 3, 4]) |> length
 * // -> 4
 * ```
 */
export function length(iterator) {
  let _pipe = iterator.continuation;
  return do_length(_pipe, 0);
}

/**
 * Traverse an iterator, calling a function on each element.
 *
 * ## Examples
 *
 * ```gleam
 * empty() |> each(io.println)
 * // -> Nil
 * ```
 *
 * ```gleam
 * from_list(["Tom", "Malory", "Louis"]) |> each(io.println)
 * // -> Nil
 * // Tom
 * // Malory
 * // Louis
 * ```
 */
export function each(iterator, f) {
  let _pipe = iterator;
  let _pipe$1 = map(_pipe, f);
  return run(_pipe$1);
}

/**
 * Add a new element to the start of an iterator.
 *
 * This function is for use with `use` expressions, to replicate the behaviour
 * of the `yield` keyword found in other languages.
 *
 * ## Examples
 *
 * ```gleam
 * let iterator = {
 *   use <- yield(1)
 *   use <- yield(2)
 *   use <- yield(3)
 *   empty()
 * }
 *
 * iterator |> to_list
 * // -> [1, 2, 3]
 * ```
 */
export function yield$(element, next) {
  return new Iterator(
    () => { return new Continue(element, next().continuation); },
  );
}
