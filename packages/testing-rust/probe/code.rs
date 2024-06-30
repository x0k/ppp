
fn foo() -> Result<(), Box<dyn std::error::Error>> {
  use std::fs::File;
  use std::io::prelude::*;
  let mut file = File::create("/foo.txt")?;
  file.write_all(b"Hello, world!")?;
  Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
  foo()
}
