using System.Runtime.InteropServices.JavaScript;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.JSInterop;




public partial class Program
{

    private static readonly IJSRuntime _jsRuntime;

    [JSExport]
    internal static void Compile(string code)
    {
        SyntaxTree tree = CSharpSyntaxTree.ParseText(code);
    }

    [JSExport]
    internal static void Test()
    {
        _jsRuntime.InvokeAsync<IJSObjectReference>("test");
    }

    [JSImport("window.location.href", "main.js")]
    internal static partial string GetHRef();
}
