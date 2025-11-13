import { CustomType as $CustomType } from "../gleam.mjs";
import * as $option from "../gleam/option.mjs";
import {
  compile_regex as do_compile,
  regex_check as do_check,
  regex_split as do_split,
  regex_scan as do_scan,
} from "../gleam_stdlib.mjs";

export class Match extends $CustomType {
  constructor(content, submatches) {
    super();
    this.content = content;
    this.submatches = submatches;
  }
}
export const Match$Match = (content, submatches) =>
  new Match(content, submatches);
export const Match$isMatch = (value) => value instanceof Match;
export const Match$Match$content = (value) => value.content;
export const Match$Match$0 = (value) => value.content;
export const Match$Match$submatches = (value) => value.submatches;
export const Match$Match$1 = (value) => value.submatches;

export class CompileError extends $CustomType {
  constructor(error, byte_index) {
    super();
    this.error = error;
    this.byte_index = byte_index;
  }
}
export const CompileError$CompileError = (error, byte_index) =>
  new CompileError(error, byte_index);
export const CompileError$isCompileError = (value) =>
  value instanceof CompileError;
export const CompileError$CompileError$error = (value) => value.error;
export const CompileError$CompileError$0 = (value) => value.error;
export const CompileError$CompileError$byte_index = (value) => value.byte_index;
export const CompileError$CompileError$1 = (value) => value.byte_index;

export class Options extends $CustomType {
  constructor(case_insensitive, multi_line) {
    super();
    this.case_insensitive = case_insensitive;
    this.multi_line = multi_line;
  }
}
export const Options$Options = (case_insensitive, multi_line) =>
  new Options(case_insensitive, multi_line);
export const Options$isOptions = (value) => value instanceof Options;
export const Options$Options$case_insensitive = (value) =>
  value.case_insensitive;
export const Options$Options$0 = (value) => value.case_insensitive;
export const Options$Options$multi_line = (value) => value.multi_line;
export const Options$Options$1 = (value) => value.multi_line;

/**
 * Creates a `Regex` with some additional options.
 *
 * ## Examples
 *
 * ```gleam
 * let options = Options(case_insensitive: False, multi_line: True)
 * let assert Ok(re) = compile("^[0-9]", with: options)
 * check(re, "abc\n123")
 * // -> True
 * ```
 *
 * ```gleam
 * let options = Options(case_insensitive: True, multi_line: False)
 * let assert Ok(re) = compile("[A-Z]", with: options)
 * check(re, "abc123")
 * // -> True
 * ```
 */
export function compile(pattern, options) {
  return do_compile(pattern, options);
}

/**
 * Creates a new `Regex`.
 *
 * ## Examples
 *
 * ```gleam
 * let assert Ok(re) = from_string("[0-9]")
 * check(re, "abc123")
 * // -> True
 * ```
 *
 * ```gleam
 * check(re, "abcxyz")
 * // -> False
 * ```
 *
 * ```gleam
 * from_string("[0-9")
 * // -> Error(CompileError(
 * //   error: "missing terminating ] for character class",
 * //   byte_index: 4
 * // ))
 * ```
 */
export function from_string(pattern) {
  return compile(pattern, new Options(false, false));
}

/**
 * Returns a boolean indicating whether there was a match or not.
 *
 * ## Examples
 *
 * ```gleam
 * let assert Ok(re) = from_string("^f.o.?")
 * check(with: re, content: "foo")
 * // -> True
 * ```
 *
 * ```gleam
 * check(with: re, content: "boo")
 * // -> False
 * ```
 */
export function check(regex, content) {
  return do_check(regex, content);
}

/**
 * Splits a string.
 *
 * ## Examples
 *
 * ```gleam
 * let assert Ok(re) = from_string(" *, *")
 * split(with: re, content: "foo,32, 4, 9  ,0")
 * // -> ["foo", "32", "4", "9", "0"]
 * ```
 */
export function split(regex, string) {
  return do_split(regex, string);
}

/**
 * Collects all matches of the regular expression.
 *
 * ## Examples
 *
 * ```gleam
 * let assert Ok(re) = from_string("[oi]n a (\\w+)")
 * scan(with: re, content: "I am on a boat in a lake.")
 * // -> [
 * //   Match(content: "on a boat", submatches: [Some("boat")]),
 * //   Match(content: "in a lake", submatches: [Some("lake")]),
 * // ]
 * ```
 *
 * ```gleam
 * let assert Ok(re) = regex.from_string("([+|\\-])?(\\d+)(\\w+)?")
 * scan(with: re, content: "-36")
 * // -> [
 * //   Match(content: "-36", submatches: [Some("-"), Some("36")])
 * // ]
 *
 * scan(with: re, content: "36")
 * // -> [
 * //   Match(content: "36", submatches: [None, Some("36")])
 * // ]
 * ```
 *
 * ```gleam
 * let assert Ok(re) =
 *   regex.from_string("var\\s*(\\w+)\\s*(int|string)?\\s*=\\s*(.*)")
 * scan(with: re, content: "var age = 32")
 * // -> [
 * //   Match(
 * //     content: "var age = 32",
 * //     submatches: [Some("age"), None, Some("32")],
 * //   ),
 * // ]
 * ```
 *
 * ```gleam
 * let assert Ok(re) = regex.from_string("let (\\w+) = (\\w+)")
 * scan(with: re, content: "let age = 32")
 * // -> [
 * //   Match(
 * //     content: "let age = 32",
 * //     submatches: [Some("age"), Some("32")],
 * //   ),
 * // ]
 *
 * scan(with: re, content: "const age = 32")
 * // -> []
 * ```
 */
export function scan(regex, string) {
  return do_scan(regex, string);
}
