// This code is copied from Gleam Language Tour
// https://github.com/gleam-lang/language-tour/blob/dd77aae/src/tour.gleam (No license)

import gleam/io
import gleam/list
import gleam/result
import gleam/string
import simplifile
import snag

const dist = "dist"

const dist_precompiled = "dist/precompiled"

const prelude = "build/dev/javascript/prelude.mjs"

const stdlib_compiled = "build/dev/javascript/gleam_stdlib/gleam"

const stdlib_sources = "build/packages/gleam_stdlib/src/gleam"

const stdlib_external = "build/packages/gleam_stdlib/src"

// Don't include deprecated stdlib modules
const skipped_stdlib_modules = [
  "bit_string.gleam", "bit_builder.gleam", "map.gleam",
]

pub fn main() {
  let result = {
    use _ <- result.try(reset_output())
    use _ <- result.try(make_prelude_available())
    use _ <- result.try(make_stdlib_available())
    Ok(Nil)
  }

  case result {
    Ok(_) -> {
      io.println("Success")
    }
    Error(snag) -> {
      panic as snag.pretty_print(snag)
    }
  }
}

fn file_error(
  result: Result(t, simplifile.FileError),
  context: String,
) -> snag.Result(t) {
  case result {
    Ok(value) -> Ok(value)
    Error(error) ->
      snag.error("File error: " <> string.inspect(error))
      |> snag.context(context)
  }
}

fn require(
  that condition: Bool,
  because reason: String,
  then next: fn() -> snag.Result(t),
) -> snag.Result(t) {
  case condition {
    True -> next()
    False -> Error(snag.new(reason))
  }
}

fn reset_output() -> snag.Result(Nil) {
  use _ <- result.try(
    simplifile.create_directory_all(dist)
    |> file_error("Failed to delete dist directory"),
  )

  use files <- result.try(
    simplifile.read_directory(dist)
    |> file_error("Failed to read dist directory"),
  )

  use _ <- result.try(
    files
    |> list.map(string.append(dist <> "/", _))
    |> simplifile.delete_all
    |> file_error("Failed to delete public directory"),
  )

  Ok(Nil)
}

fn make_prelude_available() -> snag.Result(Nil) {
  use _ <- result.try(
    simplifile.create_directory_all(dist_precompiled)
    |> file_error("Failed to make " <> dist_precompiled),
  )

  simplifile.copy_file(prelude, dist_precompiled <> "/gleam.mjs")
  |> file_error("Failed to copy prelude.mjs")
}

fn make_stdlib_available() -> snag.Result(Nil) {
  use files <- result.try(
    simplifile.read_directory(stdlib_sources)
    |> file_error("Failed to read stdlib directory"),
  )

  let modules =
    files
    |> list.filter(fn(file) { string.ends_with(file, ".gleam") })
    |> list.filter(fn(file) { !list.contains(skipped_stdlib_modules, file) })
    |> list.map(string.replace(_, ".gleam", ""))

  use _ <- result.try(
    generate_stdlib_bundle(modules)
    |> snag.context("Failed to generate stdlib.js bundle"),
  )

  use _ <- result.try(
    copy_compiled_stdlib(modules)
    |> snag.context("Failed to copy precompiled stdlib modules"),
  )

  use _ <- result.try(
    copy_stdlib_externals()
    |> snag.context("Failed to copy stdlib external files"),
  )

  Ok(Nil)
}

fn generate_stdlib_bundle(modules: List(String)) -> snag.Result(Nil) {
  use entries <- result.try(
    list.try_map(modules, fn(name) {
      let path = stdlib_sources <> "/" <> name <> ".gleam"
      use code <- result.try(
        simplifile.read(path)
        |> file_error("Failed to read stdlib module " <> path),
      )
      let name = string.replace(name, ".gleam", "")
      let code =
        code
        |> string.replace("\\", "\\\\")
        |> string.replace("`", "\\`")
        |> string.replace("$", "\\$")
        |> string.split("\n")
        |> list.filter(fn(line) { !string.starts_with(string.trim(line), "//") })
        |> list.filter(fn(line) {
          !string.starts_with(line, "@external(erlang")
        })
        |> list.filter(fn(line) { line != "" })
        |> string.join("\n")

      Ok("  \"gleam/" <> name <> "\": `" <> code <> "`")
    }),
  )

  entries
  |> string.join(",\n")
  |> string.append("export default {\n", _)
  |> string.append("\n}\n")
  |> simplifile.write(dist <> "/stdlib.js", _)
  |> file_error("Failed to write stdlib.js")
}

fn copy_compiled_stdlib(modules: List(String)) -> snag.Result(Nil) {
  use is_dir <- result.try(
    simplifile.is_directory(stdlib_compiled)
    |> file_error("Failed to get info on compiled stdlib directory"),
  )

  use <- require(is_dir, "Project must have been compiled for JavaScript")

  let dest = dist_precompiled <> "/gleam"
  use _ <- result.try(
    simplifile.create_directory_all(dest)
    |> file_error("Failed to make " <> dest),
  )

  use _ <- result.try(
    list.try_each(modules, fn(name) {
      let from = stdlib_compiled <> "/" <> name <> ".mjs"
      let to = dest <> "/" <> name <> ".mjs"
      simplifile.copy_file(from, to)
      |> file_error("Failed to copy stdlib module " <> from)
    }),
  )

  Ok(Nil)
}

fn copy_stdlib_externals() -> snag.Result(Nil) {
  use files <- result.try(
    simplifile.read_directory(stdlib_external)
    |> file_error("Failed to read stdlib external directory"),
  )
  let files = list.filter(files, string.ends_with(_, ".mjs"))

  list.try_each(files, fn(file) {
    let from = stdlib_external <> "/" <> file
    let to = dist_precompiled <> "/" <> file
    simplifile.copy_file(from, to)
    |> file_error("Failed to copy stdlib external file " <> from)
  })
}
