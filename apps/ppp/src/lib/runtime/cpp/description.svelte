Your C++ code is compiled to WebAssembly by a real Clang/LLD toolchain running inside your browser,
then executed in a web worker environment.

<p>
	The solution is based on <a
		class="link"
		target="_blank"
		href="https://github.com/BertalanD/browsercc">browsercc</a
	>
	(LLVM 20 compiled to WASI). The toolchain is large (~95&nbsp;MB), it is downloaded once and cached by
	the browser.
</p>
