using System.Runtime.InteropServices.JavaScript;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

namespace Compiler
{
    public partial class Api
    {
        [JSExport]
        internal static void Compile(string code)
        {
            SyntaxTree tree = CSharpSyntaxTree.ParseText(code);
        }

        [JSImport("window.location.href", "main.js")]
        internal static partial string GetHRef();
    }

}