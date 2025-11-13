import {
  Ok,
  Error,
  toList,
  Empty as $Empty,
  prepend as listPrepend,
  CustomType as $CustomType,
  isEqual,
} from "../gleam.mjs";
import * as $list from "../gleam/list.mjs";

class Queue extends $CustomType {
  constructor(in$, out) {
    super();
    this.in = in$;
    this.out = out;
  }
}

/**
 * Creates a fresh queue that contains no values.
 */
export function new$() {
  return new Queue(toList([]), toList([]));
}

/**
 * Converts a list of elements into a queue of the same elements in the same
 * order. The first element in the list becomes the front element in the queue.
 *
 * This function runs in constant time.
 *
 * # Examples
 *
 * ```gleam
 * [1, 2, 3] |> from_list |> length
 * // -> 3
 * ```
 */
export function from_list(list) {
  return new Queue(toList([]), list);
}

/**
 * Converts a queue of elements into a list of the same elements in the same
 * order. The front element in the queue becomes the first element in the list.
 *
 * This function runs in linear time.
 *
 * # Examples
 *
 * ```gleam
 * new() |> push_back(1) |> push_back(2) |> to_list
 * // -> [1, 2]
 * ```
 */
export function to_list(queue) {
  let _pipe = queue.out;
  return $list.append(_pipe, $list.reverse(queue.in));
}

/**
 * Determines whether or not the queue is empty.
 *
 * This function runs in constant time.
 *
 * ## Examples
 *
 * ```gleam
 * [] |> from_list |> is_empty
 * // -> True
 * ```
 *
 * ```gleam
 * [1] |> from_list |> is_empty
 * // -> False
 * ```
 *
 * ```gleam
 * [1, 2] |> from_list |> is_empty
 * // -> False
 * ```
 */
export function is_empty(queue) {
  return (isEqual(queue.in, toList([]))) && (isEqual(queue.out, toList([])));
}

/**
 * Counts the number of elements in a given queue.
 *
 * This function has to traverse the queue to determine the number of elements,
 * so it runs in linear time.
 *
 * ## Examples
 *
 * ```gleam
 * length(from_list([]))
 * // -> 0
 * ```
 *
 * ```gleam
 * length(from_list([1]))
 * // -> 1
 * ```
 *
 * ```gleam
 * length(from_list([1, 2]))
 * // -> 2
 * ```
 */
export function length(queue) {
  return $list.length(queue.in) + $list.length(queue.out);
}

/**
 * Pushes an element onto the back of the queue.
 *
 * # Examples
 *
 * ```gleam
 * [1, 2] |> from_list |> push_back(3) |> to_list
 * // -> [1, 2, 3]
 * ```
 */
export function push_back(queue, item) {
  return new Queue(listPrepend(item, queue.in), queue.out);
}

/**
 * Pushes an element onto the front of the queue.
 *
 * # Examples
 *
 * ```gleam
 * [0, 0] |> from_list |> push_front(1) |> to_list
 * // -> [1, 0, 0]
 * ```
 */
export function push_front(queue, item) {
  return new Queue(queue.in, listPrepend(item, queue.out));
}

/**
 * Gets the last element from the queue, returning the
 * element and a new queue without that element.
 *
 * This function typically runs in constant time, but will occasionally run in
 * linear time.
 *
 * # Examples
 *
 * ```gleam
 * new()
 * |> push_back(0)
 * |> push_back(1)
 * |> pop_back
 * // -> Ok(#(1, push_front(new(), 0)))
 * ```
 *
 * ```gleam
 * new()
 * |> push_front(0)
 * |> pop_back
 * // -> Ok(#(0, new()))
 * ```
 *
 * ```gleam
 * new() |> pop_back
 * // -> Error(Nil)
 * ```
 */
export function pop_back(loop$queue) {
  while (true) {
    let queue = loop$queue;
    let $ = queue.in;
    if ($ instanceof $Empty) {
      let $1 = queue.out;
      if ($1 instanceof $Empty) {
        return new Error(undefined);
      } else {
        let out = $1;
        loop$queue = new Queue($list.reverse(out), toList([]));
      }
    } else {
      let out = queue.out;
      let first = $.head;
      let rest = $.tail;
      let queue$1 = new Queue(rest, out);
      return new Ok([first, queue$1]);
    }
  }
}

/**
 * Gets the first element from the queue, returning the
 * element and a new queue without that element.
 *
 * This function typically runs in constant time, but will occasionally run in
 * linear time.
 *
 * # Examples
 *
 * ```gleam
 * new()
 * |> push_front(1)
 * |> push_front(0)
 * |> pop_front
 * // -> Ok(#(0, push_back(new(), 1)))
 * ```
 *
 * ```gleam
 * new()
 * |> push_back(0)
 * |> pop_front
 * // -> Ok(#(0, new()))
 * ```
 *
 * ```gleam
 * new() |> pop_back
 * // -> Error(Nil)
 * ```
 */
export function pop_front(loop$queue) {
  while (true) {
    let queue = loop$queue;
    let $ = queue.out;
    if ($ instanceof $Empty) {
      let $1 = queue.in;
      if ($1 instanceof $Empty) {
        return new Error(undefined);
      } else {
        let in$ = $1;
        loop$queue = new Queue(toList([]), $list.reverse(in$));
      }
    } else {
      let in$ = queue.in;
      let first = $.head;
      let rest = $.tail;
      let queue$1 = new Queue(in$, rest);
      return new Ok([first, queue$1]);
    }
  }
}

/**
 * Creates a new queue from a given queue containing the same elements, but in
 * the opposite order.
 *
 * This function runs in constant time.
 *
 * ## Examples
 *
 * ```gleam
 * [] |> from_list |> reverse |> to_list
 * // -> []
 * ```
 *
 * ```gleam
 * [1] |> from_list |> reverse |> to_list
 * // -> [1]
 * ```
 *
 * ```gleam
 * [1, 2] |> from_list |> reverse |> to_list
 * // -> [2, 1]
 * ```
 */
export function reverse(queue) {
  return new Queue(queue.out, queue.in);
}

function check_equal(loop$xs, loop$x_tail, loop$ys, loop$y_tail, loop$eq) {
  while (true) {
    let xs = loop$xs;
    let x_tail = loop$x_tail;
    let ys = loop$ys;
    let y_tail = loop$y_tail;
    let eq = loop$eq;
    if (xs instanceof $Empty) {
      if (x_tail instanceof $Empty) {
        if (ys instanceof $Empty) {
          if (y_tail instanceof $Empty) {
            return true;
          } else {
            loop$xs = xs;
            loop$x_tail = x_tail;
            loop$ys = $list.reverse(y_tail);
            loop$y_tail = toList([]);
            loop$eq = eq;
          }
        } else {
          return false;
        }
      } else {
        loop$xs = $list.reverse(x_tail);
        loop$x_tail = toList([]);
        loop$ys = ys;
        loop$y_tail = y_tail;
        loop$eq = eq;
      }
    } else if (ys instanceof $Empty) {
      if (y_tail instanceof $Empty) {
        return false;
      } else {
        loop$xs = xs;
        loop$x_tail = x_tail;
        loop$ys = $list.reverse(y_tail);
        loop$y_tail = toList([]);
        loop$eq = eq;
      }
    } else {
      let x = xs.head;
      let xs$1 = xs.tail;
      let y = ys.head;
      let ys$1 = ys.tail;
      let $ = eq(x, y);
      if ($) {
        loop$xs = xs$1;
        loop$x_tail = x_tail;
        loop$ys = ys$1;
        loop$y_tail = y_tail;
        loop$eq = eq;
      } else {
        return $;
      }
    }
  }
}

/**
 * Checks whether two queues have equal elements in the same order, where the
 * equality of elements is determined by a given equality checking function.
 *
 * This function is useful as the internal representation may be different for
 * two queues with the same elements in the same order depending on how they
 * were constructed, so the equality operator `==` may return surprising
 * results.
 *
 * This function runs in linear time multiplied by the time taken by the
 * element equality checking function.
 */
export function is_logically_equal(a, b, element_is_equal) {
  return check_equal(a.out, a.in, b.out, b.in, element_is_equal);
}

/**
 * Checks whether two queues have the same elements in the same order.
 *
 * This function is useful as the internal representation may be different for
 * two queues with the same elements in the same order depending on how they
 * were constructed, so the equality operator `==` may return surprising
 * results.
 *
 * This function runs in linear time.
 */
export function is_equal(a, b) {
  return check_equal(
    a.out,
    a.in,
    b.out,
    b.in,
    (a, b) => { return isEqual(a, b); },
  );
}
