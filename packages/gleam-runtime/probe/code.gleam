import gleam/io

pub fn myfn(n: Int, s: String, l: List(Int)) {
  io.println("Hello, Joe!")
  io.debug(n)
  io.debug(s)
  io.debug(l)
}
