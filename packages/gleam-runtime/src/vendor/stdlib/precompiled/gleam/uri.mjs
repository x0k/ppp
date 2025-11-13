import {
  Ok,
  Error,
  toList,
  Empty as $Empty,
  prepend as listPrepend,
  CustomType as $CustomType,
  isEqual,
} from "../gleam.mjs";
import * as $int from "../gleam/int.mjs";
import * as $list from "../gleam/list.mjs";
import * as $option from "../gleam/option.mjs";
import { None, Some } from "../gleam/option.mjs";
import * as $pair from "../gleam/pair.mjs";
import * as $regex from "../gleam/regex.mjs";
import * as $result from "../gleam/result.mjs";
import * as $string from "../gleam/string.mjs";
import * as $string_builder from "../gleam/string_builder.mjs";
import {
  parse_query as do_parse_query,
  percent_encode as do_percent_encode,
  percent_decode as do_percent_decode,
} from "../gleam_stdlib.mjs";

export class Uri extends $CustomType {
  constructor(scheme, userinfo, host, port, path, query, fragment) {
    super();
    this.scheme = scheme;
    this.userinfo = userinfo;
    this.host = host;
    this.port = port;
    this.path = path;
    this.query = query;
    this.fragment = fragment;
  }
}
export const Uri$Uri = (scheme, userinfo, host, port, path, query, fragment) =>
  new Uri(scheme, userinfo, host, port, path, query, fragment);
export const Uri$isUri = (value) => value instanceof Uri;
export const Uri$Uri$scheme = (value) => value.scheme;
export const Uri$Uri$0 = (value) => value.scheme;
export const Uri$Uri$userinfo = (value) => value.userinfo;
export const Uri$Uri$1 = (value) => value.userinfo;
export const Uri$Uri$host = (value) => value.host;
export const Uri$Uri$2 = (value) => value.host;
export const Uri$Uri$port = (value) => value.port;
export const Uri$Uri$3 = (value) => value.port;
export const Uri$Uri$path = (value) => value.path;
export const Uri$Uri$4 = (value) => value.path;
export const Uri$Uri$query = (value) => value.query;
export const Uri$Uri$5 = (value) => value.query;
export const Uri$Uri$fragment = (value) => value.fragment;
export const Uri$Uri$6 = (value) => value.fragment;

function regex_submatches(pattern, string) {
  let _pipe = pattern;
  let _pipe$1 = $regex.compile(_pipe, new $regex.Options(true, false));
  let _pipe$2 = $result.nil_error(_pipe$1);
  let _pipe$3 = $result.map(
    _pipe$2,
    (_capture) => { return $regex.scan(_capture, string); },
  );
  let _pipe$4 = $result.try$(_pipe$3, $list.first);
  let _pipe$5 = $result.map(_pipe$4, (m) => { return m.submatches; });
  return $result.unwrap(_pipe$5, toList([]));
}

function noneify_query(x) {
  if (x instanceof Some) {
    let x$1 = x[0];
    let $ = $string.pop_grapheme(x$1);
    if ($ instanceof Ok) {
      let $1 = $[0][0];
      if ($1 === "?") {
        let query = $[0][1];
        return new Some(query);
      } else {
        return new None();
      }
    } else {
      return new None();
    }
  } else {
    return x;
  }
}

function noneify_empty_string(x) {
  if (x instanceof Some) {
    let $ = x[0];
    if ($ === "") {
      return new None();
    } else {
      return x;
    }
  } else {
    return new None();
  }
}

function extra_required(loop$list, loop$remaining) {
  while (true) {
    let list = loop$list;
    let remaining = loop$remaining;
    if (remaining === 0) {
      return 0;
    } else if (list instanceof $Empty) {
      return remaining;
    } else {
      let xs = list.tail;
      loop$list = xs;
      loop$remaining = remaining - 1;
    }
  }
}

function pad_list(list, size) {
  let _pipe = list;
  return $list.append(
    _pipe,
    $list.repeat(new None(), extra_required(list, size)),
  );
}

function split_authority(authority) {
  let $ = $option.unwrap(authority, "");
  if ($ === "") {
    return [new None(), new None(), new None()];
  } else if ($ === "//") {
    return [new None(), new Some(""), new None()];
  } else {
    let authority$1 = $;
    let _block;
    let _pipe = "^(//)?((.*)@)?(\\[[a-zA-Z0-9:.]*\\]|[^:]*)(:(\\d*))?";
    let _pipe$1 = regex_submatches(_pipe, authority$1);
    _block = pad_list(_pipe$1, 6);
    let matches = _block;
    if (matches instanceof $Empty) {
      return [new None(), new None(), new None()];
    } else {
      let $1 = matches.tail;
      if ($1 instanceof $Empty) {
        return [new None(), new None(), new None()];
      } else {
        let $2 = $1.tail;
        if ($2 instanceof $Empty) {
          return [new None(), new None(), new None()];
        } else {
          let $3 = $2.tail;
          if ($3 instanceof $Empty) {
            return [new None(), new None(), new None()];
          } else {
            let $4 = $3.tail;
            if ($4 instanceof $Empty) {
              return [new None(), new None(), new None()];
            } else {
              let $5 = $4.tail;
              if ($5 instanceof $Empty) {
                return [new None(), new None(), new None()];
              } else {
                let $6 = $5.tail;
                if ($6 instanceof $Empty) {
                  let userinfo = $2.head;
                  let host = $3.head;
                  let port = $5.head;
                  let userinfo$1 = noneify_empty_string(userinfo);
                  let host$1 = noneify_empty_string(host);
                  let _block$1;
                  let _pipe$2 = port;
                  let _pipe$3 = $option.unwrap(_pipe$2, "");
                  let _pipe$4 = $int.parse(_pipe$3);
                  _block$1 = $option.from_result(_pipe$4);
                  let port$1 = _block$1;
                  return [userinfo$1, host$1, port$1];
                } else {
                  return [new None(), new None(), new None()];
                }
              }
            }
          }
        }
      }
    }
  }
}

function do_parse(uri_string) {
  let pattern = "^(([a-z][a-z0-9\\+\\-\\.]*):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#.*)?";
  let _block;
  let _pipe = pattern;
  let _pipe$1 = regex_submatches(_pipe, uri_string);
  _block = pad_list(_pipe$1, 8);
  let matches = _block;
  let _block$1;
  if (matches instanceof $Empty) {
    _block$1 = [new None(), new None(), new None(), new None(), new None()];
  } else {
    let $1 = matches.tail;
    if ($1 instanceof $Empty) {
      _block$1 = [new None(), new None(), new None(), new None(), new None()];
    } else {
      let $2 = $1.tail;
      if ($2 instanceof $Empty) {
        _block$1 = [new None(), new None(), new None(), new None(), new None()];
      } else {
        let $3 = $2.tail;
        if ($3 instanceof $Empty) {
          _block$1 = [
            new None(),
            new None(),
            new None(),
            new None(),
            new None(),
          ];
        } else {
          let $4 = $3.tail;
          if ($4 instanceof $Empty) {
            _block$1 = [
              new None(),
              new None(),
              new None(),
              new None(),
              new None(),
            ];
          } else {
            let $5 = $4.tail;
            if ($5 instanceof $Empty) {
              _block$1 = [
                new None(),
                new None(),
                new None(),
                new None(),
                new None(),
              ];
            } else {
              let $6 = $5.tail;
              if ($6 instanceof $Empty) {
                _block$1 = [
                  new None(),
                  new None(),
                  new None(),
                  new None(),
                  new None(),
                ];
              } else {
                let $7 = $6.tail;
                if ($7 instanceof $Empty) {
                  _block$1 = [
                    new None(),
                    new None(),
                    new None(),
                    new None(),
                    new None(),
                  ];
                } else {
                  let $8 = $7.tail;
                  if ($8 instanceof $Empty) {
                    let scheme = $1.head;
                    let authority_with_slashes = $2.head;
                    let path = $4.head;
                    let query_with_question_mark = $5.head;
                    let fragment = $7.head;
                    _block$1 = [
                      scheme,
                      authority_with_slashes,
                      path,
                      query_with_question_mark,
                      fragment,
                    ];
                  } else {
                    _block$1 = [
                      new None(),
                      new None(),
                      new None(),
                      new None(),
                      new None(),
                    ];
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  let $ = _block$1;
  let scheme;
  let authority;
  let path;
  let query;
  let fragment;
  scheme = $[0];
  authority = $[1];
  path = $[2];
  query = $[3];
  fragment = $[4];
  let scheme$1 = noneify_empty_string(scheme);
  let path$1 = $option.unwrap(path, "");
  let query$1 = noneify_query(query);
  let $1 = split_authority(authority);
  let userinfo;
  let host;
  let port;
  userinfo = $1[0];
  host = $1[1];
  port = $1[2];
  let _block$2;
  let _pipe$2 = fragment;
  let _pipe$3 = $option.to_result(_pipe$2, undefined);
  let _pipe$4 = $result.try$(_pipe$3, $string.pop_grapheme);
  let _pipe$5 = $result.map(_pipe$4, $pair.second);
  _block$2 = $option.from_result(_pipe$5);
  let fragment$1 = _block$2;
  let _block$3;
  let _pipe$6 = scheme$1;
  let _pipe$7 = noneify_empty_string(_pipe$6);
  _block$3 = $option.map(_pipe$7, $string.lowercase);
  let scheme$2 = _block$3;
  return new Ok(
    new Uri(scheme$2, userinfo, host, port, path$1, query$1, fragment$1),
  );
}

/**
 * Parses a compliant URI string into the `Uri` Type.
 * If the string is not a valid URI string then an error is returned.
 *
 * The opposite operation is `uri.to_string`.
 *
 * ## Examples
 *
 * ```gleam
 * parse("https://example.com:1234/a/b?query=true#fragment")
 * // -> Ok(
 * //   Uri(
 * //     scheme: Some("https"),
 * //     userinfo: None,
 * //     host: Some("example.com"),
 * //     port: Some(1234),
 * //     path: "/a/b",
 * //     query: Some("query=true"),
 * //     fragment: Some("fragment")
 * //   )
 * // )
 * ```
 */
export function parse(uri_string) {
  return do_parse(uri_string);
}

/**
 * Parses an urlencoded query string into a list of key value pairs.
 * Returns an error for invalid encoding.
 *
 * The opposite operation is `uri.query_to_string`.
 *
 * ## Examples
 *
 * ```gleam
 * parse_query("a=1&b=2")
 * // -> Ok([#("a", "1"), #("b", "2")])
 * ```
 */
export function parse_query(query) {
  return do_parse_query(query);
}

/**
 * Encodes a string into a percent encoded representation.
 *
 * ## Examples
 *
 * ```gleam
 * percent_encode("100% great")
 * // -> "100%25%20great"
 * ```
 */
export function percent_encode(value) {
  return do_percent_encode(value);
}

function query_pair(pair) {
  return $string_builder.from_strings(
    toList([percent_encode(pair[0]), "=", percent_encode(pair[1])]),
  );
}

/**
 * Encodes a list of key value pairs as a URI query string.
 *
 * The opposite operation is `uri.parse_query`.
 *
 * ## Examples
 *
 * ```gleam
 * query_to_string([#("a", "1"), #("b", "2")])
 * // -> "a=1&b=2"
 * ```
 */
export function query_to_string(query) {
  let _pipe = query;
  let _pipe$1 = $list.map(_pipe, query_pair);
  let _pipe$2 = $list.intersperse(_pipe$1, $string_builder.from_string("&"));
  let _pipe$3 = $string_builder.concat(_pipe$2);
  return $string_builder.to_string(_pipe$3);
}

/**
 * Decodes a percent encoded string.
 *
 * ## Examples
 *
 * ```gleam
 * percent_decode("100%25+great")
 * // -> Ok("100% great")
 * ```
 */
export function percent_decode(value) {
  return do_percent_decode(value);
}

function do_remove_dot_segments(loop$input, loop$accumulator) {
  while (true) {
    let input = loop$input;
    let accumulator = loop$accumulator;
    if (input instanceof $Empty) {
      return $list.reverse(accumulator);
    } else {
      let segment = input.head;
      let rest = input.tail;
      let _block;
      if (segment === "") {
        _block = accumulator;
      } else if (segment === ".") {
        _block = accumulator;
      } else if (segment === "..") {
        if (accumulator instanceof $Empty) {
          _block = accumulator;
        } else {
          let accumulator$1 = accumulator.tail;
          _block = accumulator$1;
        }
      } else {
        let segment$1 = segment;
        let accumulator$1 = accumulator;
        _block = listPrepend(segment$1, accumulator$1);
      }
      let accumulator$1 = _block;
      loop$input = rest;
      loop$accumulator = accumulator$1;
    }
  }
}

function remove_dot_segments(input) {
  return do_remove_dot_segments(input, toList([]));
}

/**
 * Splits the path section of a URI into it's constituent segments.
 *
 * Removes empty segments and resolves dot-segments as specified in
 * [section 5.2](https://www.ietf.org/rfc/rfc3986.html#section-5.2) of the RFC.
 *
 * ## Examples
 *
 * ```gleam
 * path_segments("/users/1")
 * // -> ["users" ,"1"]
 * ```
 */
export function path_segments(path) {
  return remove_dot_segments($string.split(path, "/"));
}

/**
 * Encodes a `Uri` value as a URI string.
 *
 * The opposite operation is `uri.parse`.
 *
 * ## Examples
 *
 * ```gleam
 * let uri = Uri(Some("http"), None, Some("example.com"), ...)
 * to_string(uri)
 * // -> "http://example.com"
 * ```
 */
export function to_string(uri) {
  let _block;
  let $ = uri.fragment;
  if ($ instanceof Some) {
    let fragment = $[0];
    _block = toList(["#", fragment]);
  } else {
    _block = toList([]);
  }
  let parts = _block;
  let _block$1;
  let $1 = uri.query;
  if ($1 instanceof Some) {
    let query = $1[0];
    _block$1 = listPrepend("?", listPrepend(query, parts));
  } else {
    _block$1 = parts;
  }
  let parts$1 = _block$1;
  let parts$2 = listPrepend(uri.path, parts$1);
  let _block$2;
  let $2 = uri.host;
  let $3 = $string.starts_with(uri.path, "/");
  if ($2 instanceof Some && !$3) {
    let host = $2[0];
    if (host !== "") {
      _block$2 = listPrepend("/", parts$2);
    } else {
      _block$2 = parts$2;
    }
  } else {
    _block$2 = parts$2;
  }
  let parts$3 = _block$2;
  let _block$3;
  let $4 = uri.host;
  let $5 = uri.port;
  if ($4 instanceof Some && $5 instanceof Some) {
    let port = $5[0];
    _block$3 = listPrepend(":", listPrepend($int.to_string(port), parts$3));
  } else {
    _block$3 = parts$3;
  }
  let parts$4 = _block$3;
  let _block$4;
  let $6 = uri.scheme;
  let $7 = uri.userinfo;
  let $8 = uri.host;
  if ($6 instanceof Some) {
    if ($7 instanceof Some) {
      if ($8 instanceof Some) {
        let s = $6[0];
        let u = $7[0];
        let h = $8[0];
        _block$4 = listPrepend(
          s,
          listPrepend(
            "://",
            listPrepend(u, listPrepend("@", listPrepend(h, parts$4))),
          ),
        );
      } else {
        let s = $6[0];
        _block$4 = listPrepend(s, listPrepend(":", parts$4));
      }
    } else if ($8 instanceof Some) {
      let s = $6[0];
      let h = $8[0];
      _block$4 = listPrepend(s, listPrepend("://", listPrepend(h, parts$4)));
    } else {
      let s = $6[0];
      _block$4 = listPrepend(s, listPrepend(":", parts$4));
    }
  } else if ($7 instanceof None && $8 instanceof Some) {
    let h = $8[0];
    _block$4 = listPrepend("//", listPrepend(h, parts$4));
  } else {
    _block$4 = parts$4;
  }
  let parts$5 = _block$4;
  return $string.concat(parts$5);
}

/**
 * Fetches the origin of a URI.
 *
 * Returns the origin of a uri as defined in
 * [RFC 6454](https://tools.ietf.org/html/rfc6454)
 *
 * The supported URI schemes are `http` and `https`.
 * URLs without a scheme will return `Error`.
 *
 * ## Examples
 *
 * ```gleam
 * let assert Ok(uri) = parse("http://example.com/path?foo#bar")
 * origin(uri)
 * // -> Ok("http://example.com")
 * ```
 */
export function origin(uri) {
  let scheme;
  let host;
  let port;
  scheme = uri.scheme;
  host = uri.host;
  port = uri.port;
  if (scheme instanceof Some) {
    let $ = scheme[0];
    if ($ === "https" && isEqual(port, new Some(443))) {
      let origin$1 = new Uri(
        scheme,
        new None(),
        host,
        new None(),
        "",
        new None(),
        new None(),
      );
      return new Ok(to_string(origin$1));
    } else if ($ === "http" && isEqual(port, new Some(80))) {
      let origin$1 = new Uri(
        scheme,
        new None(),
        host,
        new None(),
        "",
        new None(),
        new None(),
      );
      return new Ok(to_string(origin$1));
    } else {
      let s = $;
      if ((s === "http") || (s === "https")) {
        let origin$1 = new Uri(
          scheme,
          new None(),
          host,
          port,
          "",
          new None(),
          new None(),
        );
        return new Ok(to_string(origin$1));
      } else {
        return new Error(undefined);
      }
    }
  } else {
    return new Error(undefined);
  }
}

function drop_last(elements) {
  return $list.take(elements, $list.length(elements) - 1);
}

function join_segments(segments) {
  return $string.join(listPrepend("", segments), "/");
}

/**
 * Resolves a URI with respect to the given base URI.
 *
 * The base URI must be an absolute URI or this function will return an error.
 * The algorithm for merging uris is described in
 * [RFC 3986](https://tools.ietf.org/html/rfc3986#section-5.2).
 */
export function merge(base, relative) {
  let $ = base.scheme;
  if ($ instanceof Some) {
    let $1 = base.host;
    if ($1 instanceof Some) {
      let $2 = relative.host;
      if ($2 instanceof Some) {
        let _block;
        let _pipe = $string.split(relative.path, "/");
        let _pipe$1 = remove_dot_segments(_pipe);
        _block = join_segments(_pipe$1);
        let path = _block;
        let resolved = new Uri(
          $option.or(relative.scheme, base.scheme),
          new None(),
          relative.host,
          $option.or(relative.port, base.port),
          path,
          relative.query,
          relative.fragment,
        );
        return new Ok(resolved);
      } else {
        let _block;
        let $4 = relative.path;
        if ($4 === "") {
          _block = [base.path, $option.or(relative.query, base.query)];
        } else {
          let _block$1;
          let $5 = $string.starts_with(relative.path, "/");
          if ($5) {
            _block$1 = $string.split(relative.path, "/");
          } else {
            let _pipe = $string.split(base.path, "/");
            let _pipe$1 = drop_last(_pipe);
            _block$1 = $list.append(_pipe$1, $string.split(relative.path, "/"));
          }
          let path_segments$1 = _block$1;
          let _block$2;
          let _pipe = path_segments$1;
          let _pipe$1 = remove_dot_segments(_pipe);
          _block$2 = join_segments(_pipe$1);
          let path = _block$2;
          _block = [path, relative.query];
        }
        let $3 = _block;
        let new_path;
        let new_query;
        new_path = $3[0];
        new_query = $3[1];
        let resolved = new Uri(
          base.scheme,
          new None(),
          base.host,
          base.port,
          new_path,
          new_query,
          relative.fragment,
        );
        return new Ok(resolved);
      }
    } else {
      return new Error(undefined);
    }
  } else {
    return new Error(undefined);
  }
}
