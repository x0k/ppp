package compiler

import (
	"bytes"
	"context"
	"strings"
	"testing"
)

const helperSrc = `package main

import "fmt"

type Greeter struct{ Name string }

func (g Greeter) Greet() { fmt.Println("hello", g.Name) }

func helper() string { return "from helper" }
`

const mainSrc = `package main

import (
	"fmt"
	"strings"
)

func main() {
	g := Greeter{Name: strings.ToLower("WORLD")}
	g.Greet()
	fmt.Println(helper())
}
`

const noMainSrc = `package main

func top() string { return "top" }
`

func sources(codes ...string) []Source {
	files := make([]Source, len(codes))
	for i, code := range codes {
		files[i] = Source{Filename: "file" + string(rune('0'+i)) + ".go", Code: code}
	}
	return files
}

func newCompilerOut(t *testing.T) (*Compiler, *strings.Builder) {
	t.Helper()
	out := &strings.Builder{}
	c, err := New(&bytes.Buffer{}, out, &bytes.Buffer{})
	if err != nil {
		t.Fatal(err)
	}
	return c, out
}

func TestCompileMultiFileRunsMain(t *testing.T) {
	c, out := newCompilerOut(t)
	p, err := c.Compile(context.Background(), sources(mainSrc, helperSrc))
	if err != nil {
		t.Fatal(err)
	}
	if err := p.Exec(context.Background()); err != nil {
		t.Fatal(err)
	}
	for _, expected := range []string{"hello world", "from helper"} {
		if !strings.Contains(out.String(), expected) {
			t.Fatalf("output %q does not contain %q", out.String(), expected)
		}
	}
}

// Order of sources must not matter: merged sources form a single compilation
// unit where forward references are allowed.
func TestCompileMultiFileForwardRef(t *testing.T) {
	c, _ := newCompilerOut(t)
	p, err := c.Compile(context.Background(), sources(helperSrc, mainSrc))
	if err != nil {
		t.Fatal(err)
	}
	if err := p.Exec(context.Background()); err != nil {
		t.Fatal(err)
	}
}

func TestCompileMultiFileDuplicateImports(t *testing.T) {
	c, _ := newCompilerOut(t)
	// Both sources import "fmt": merging must deduplicate the imports.
	p, err := c.Compile(context.Background(), sources(
		helperSrc,
		"package main\n\nimport \"fmt\"\n\nfunc helper2() { fmt.Println(\"helper2\") }\n",
	))
	if err != nil {
		t.Fatal(err)
	}
	if err := p.Exec(context.Background()); err != nil {
		t.Fatal(err)
	}
}

func TestCompileSingleFile(t *testing.T) {
	c, out := newCompilerOut(t)
	src := "package main\n\nimport \"fmt\"\n\nfunc main() { fmt.Println(\"single\") }\n"
	p, err := c.Compile(context.Background(), sources(src))
	if err != nil {
		t.Fatal(err)
	}
	if err := p.Exec(context.Background()); err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(out.String(), "single") {
		t.Fatalf("unexpected output: %q", out.String())
	}
}

func TestPrepareMultiFileEvalSnippet(t *testing.T) {
	c, _ := newCompilerOut(t)
	p, err := c.Prepare(context.Background(), sources(mainSrc, helperSrc))
	if err != nil {
		t.Fatal(err)
	}
	v, err := p.Eval(context.Background(), `helper()`)
	if err != nil {
		t.Fatal(err)
	}
	if v.String() != "from helper" {
		t.Fatalf("unexpected result: %v", v)
	}
	if _, err := p.Eval(context.Background(), `Greeter{Name: "x"}.Greet()`); err != nil {
		t.Fatal(err)
	}
}

func TestPrepareSingleFile(t *testing.T) {
	c, _ := newCompilerOut(t)
	p, err := c.Prepare(context.Background(), sources(noMainSrc))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := p.Eval(context.Background(), `top()`); err != nil {
		t.Fatal(err)
	}
}

func TestConflictingPackages(t *testing.T) {
	c, _ := newCompilerOut(t)
	if _, err := c.Compile(context.Background(), sources(
		helperSrc,
		strings.Replace(helperSrc, "package main", "package other", 1),
	)); err == nil {
		t.Fatal("expected error")
	}
}

// Parse errors must reference real source filenames.
func TestParseErrorFilename(t *testing.T) {
	c, _ := newCompilerOut(t)
	_, err := c.Compile(context.Background(), sources(
		"package main\n\nfunc main() {\n",
		helperSrc,
	))
	if err == nil || !strings.Contains(err.Error(), "file0.go") {
		t.Fatalf("expected error referencing file0.go, got: %v", err)
	}
}

func TestNoSources(t *testing.T) {
	c, _ := newCompilerOut(t)
	if _, err := c.Compile(context.Background(), nil); err == nil {
		t.Fatal("expected error")
	}
}

func TestMergeNamedAndBlankImports(t *testing.T) {
	c, _ := newCompilerOut(t)
	p, err := c.Compile(context.Background(), sources(
		"package main\n\nimport (\n\t\"fmt\"\n\tstr \"strings\"\n)\n\nfunc a() { fmt.Println(str.ToUpper(\"a\")) }\n",
		"package main\n\nimport \"strings\"\n\nfunc b() string { return strings.Repeat(\"b\", 2) }\n",
	))
	if err != nil {
		t.Fatal(err)
	}
	if err := p.Exec(context.Background()); err != nil {
		t.Fatal(err)
	}
}

func TestMergeDotImport(t *testing.T) {
	c, _ := newCompilerOut(t)
	p, err := c.Compile(context.Background(), sources(
		"package main\n\nimport . \"fmt\"\n\nfunc main() { Println(\"dot\") }\n",
		"package main\n\nimport \"fmt\"\n\nvar _ = Sprintf\n",
	))
	if err != nil {
		t.Fatal(err)
	}
	if err := p.Exec(context.Background()); err != nil {
		t.Fatal(err)
	}
}

func TestMergePreservesDocComments(t *testing.T) {
	src := "package main\n\n// Doc for helper.\nfunc helper() {}\n"
	merged, err := mergeSources(sources(src, src+"\n// Another.\n"))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(merged, "// Doc for helper.") || !strings.Contains(merged, "// Another.") {
		t.Fatalf("comments lost in merged source:\n%s", merged)
	}
}
