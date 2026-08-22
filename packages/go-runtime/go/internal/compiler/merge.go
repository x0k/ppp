package compiler

import (
	"bytes"
	"errors"
	"fmt"
	"go/ast"
	"go/parser"
	"go/printer"
	"go/token"
)

// mergeSources combines multiple Go sources of the same package into a single
// source by merging their package clauses and imports and concatenating their
// declarations, so they can be interpreted as a single compilation unit.
// Yaegi has no native support for multi-file programs: sources evaluated
// separately neither share a scope nor tolerate repeated imports, so merging is
// required. Sources are parsed into an AST, merged and printed back with the
// standard go/ast and go/printer machinery, so comments and formatting are
// handled by the toolchain instead of manual text splicing.
func mergeSources(sources []Source) (string, error) {
	switch len(sources) {
	case 0:
		return "", errors.New("no sources provided")
	case 1:
		return sources[0].Code, nil
	}
	fset := token.NewFileSet()
	pkgName := ""
	pkgPos := token.NoPos
	var decls []ast.Decl
	var importSpecs []ast.Spec
	seenImports := make(map[string]bool)
	var comments []*ast.CommentGroup
	// Spans of removed per-file import declarations, so comments attached to
	// them can be dropped from the merged file.
	type span struct {
		start token.Pos
		end   token.Pos
	}
	importSpans := make([]span, 0, len(sources))

	for i, source := range sources {
		filename := source.Filename
		if filename == "" {
			filename = fmt.Sprintf("file%d.go", i)
		}
		file, err := parser.ParseFile(
			fset,
			filename,
			source.Code,
			parser.ParseComments|parser.SkipObjectResolution,
		)
		if err != nil {
			return "", err
		}
		if i == 0 {
			pkgName = file.Name.Name
			pkgPos = file.Package
		} else if file.Name.Name != pkgName {
			return "", fmt.Errorf(
				"conflicting package names: %s and %s",
				pkgName,
				file.Name.Name,
			)
		}
		for _, decl := range file.Decls {
			genDecl, ok := decl.(*ast.GenDecl)
			if !ok || genDecl.Tok != token.IMPORT {
				decls = append(decls, decl)
				continue
			}
			importSpans = append(importSpans, span{
				start: genDecl.Pos(),
				end:   genDecl.End(),
			})
			for _, spec := range genDecl.Specs {
				importSpec := spec.(*ast.ImportSpec)
				path := importSpec.Path.Value
				key := path
				if importSpec.Name != nil {
					key = importSpec.Name.Name + " " + path
				}
				if seenImports[key] {
					continue
				}
				seenImports[key] = true
				importSpecs = append(importSpecs, importSpec)
			}
		}
	comments:
		for _, group := range file.Comments {
			pos := group.Pos()
			for _, s := range importSpans {
				if pos >= s.start && pos < s.end {
					continue comments
				}
			}
			comments = append(comments, group)
		}
	}

	merged := &ast.File{
		Package:  pkgPos,
		Name:     ast.NewIdent(pkgName),
		Decls:    decls,
		Comments: comments,
	}
	if len(importSpecs) > 0 {
		merged.Decls = append([]ast.Decl{&ast.GenDecl{
			Tok:    token.IMPORT,
			TokPos: pkgPos,
			Lparen: pkgPos,
			Specs:  importSpecs,
		}}, decls...)
	}
	var out bytes.Buffer
	if err := printer.Fprint(&out, fset, merged); err != nil {
		return "", err
	}
	out.WriteString("\n")
	return out.String(), nil
}
