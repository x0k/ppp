using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Runtime.InteropServices.JavaScript;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Emit;

public partial class Logger
{
    [JSImport("logger.debug", "main.js")]
    public static partial void Debug(string message);

    [JSImport("logger.info", "main.js")]
    public static partial void Info(string message);

    [JSImport("logger.warn", "main.js")]
    public static partial void Warn(string message);

    [JSImport("logger.error", "main.js")]
    public static partial void Error(string message);

    public static void PrintDiagnostic(Diagnostic diagnostic)
    {
        switch (diagnostic.Severity)
        {
            case DiagnosticSeverity.Hidden:
                Debug(diagnostic.ToString());
                break;
            case DiagnosticSeverity.Info:
                Info(diagnostic.ToString());
                break;
            case DiagnosticSeverity.Warning:
                Warn(diagnostic.ToString());
                break;
            case DiagnosticSeverity.Error:
                Error(diagnostic.ToString());
                break;
        }
    }
}

public partial class Compiler
{

    private static List<MetadataReference> references;
    private static Assembly assembly;

    private static object executionResult;

    // Main method is required but can be empty
    public static void Main() { }

    [JSExport]
    internal static async Task<int> Init(string precompiledLibIndexPath, string[] dlls)
    {
        references = await LoadMetadataReferences(precompiledLibIndexPath, dlls);
        return 0;
    }

    [JSExport]
    [RequiresUnreferencedCode("Calls System.AppDomain.Load(Byte[])")]
    internal static int Compile(string[] code)
    {
        if (references == null)
        {
            Logger.Error("Compiler is not initialized");
            return -1;
        }
        SyntaxTree[] trees = new SyntaxTree[code.Length];
        for (int i = 0; i < code.Length; i++)
        {
            SyntaxTree tree = CSharpSyntaxTree.ParseText(code[i]);
            var hasDiagnosticError = false;
            foreach (var diagnostic in tree.GetDiagnostics())
            {
                Logger.PrintDiagnostic(diagnostic);
                if (diagnostic.Severity == DiagnosticSeverity.Error)
                {
                    hasDiagnosticError = true;
                }
            }
            if (hasDiagnosticError)
            {
                return -1;
            }
            trees[i] = tree;
        }
        var op = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary).
            WithAssemblyIdentityComparer(DesktopAssemblyIdentityComparer.Default);
        var compilation = CSharpCompilation.Create("assembly.compiler", trees, references, op);

        using MemoryStream stream = new();
        var result = compilation.Emit(stream, options: new EmitOptions());

        foreach (var diagnostic in result.Diagnostics)
        {
            Logger.PrintDiagnostic(diagnostic);
        }

        if (!result.Success)
        {
            return -1;
        }

        assembly = AppDomain.CurrentDomain.Load(stream.ToArray());
        return 0;
    }

    [JSExport]
    [RequiresUnreferencedCode("Calls System.Reflection.Assembly.GetExportedTypes()")]
    internal static int Run(string typeFullName, string methodName, string[] arguments)
    {
        if (assembly == null)
        {
            Logger.Error("There are no compiled assemblies");
            return -1;
        }
        var type = assembly.GetExportedTypes().ToList().Find(x => x.FullName == typeFullName);
        if (type == null)
        {
            Logger.Error($"Type not found: {typeFullName}");
            return -1;
        }
        var method = type.GetMethod(methodName);
        if (method == null)
        {
            Logger.Error($"Method not found: {methodName}");
            return -1;
        }
        executionResult = method.Invoke(null, arguments);
        return 0;
    }

    [JSExport]
    internal static string GetResultAsString()
    {
        if (executionResult is string result)
        {
            return result;
        }
        return null;
    }

    [JSExport]
    internal static void DisposeAssembly() {
        assembly = null;
        executionResult = null;
    }

    internal static async Task<List<MetadataReference>> LoadMetadataReferences(string precompiledLibIndexPath, string[] dlls)
    {
        List<MetadataReference> references = [];
        var client = new HttpClient();
        foreach (var url in dlls)
        {
            try
            {
                var response = await client.GetAsync($"{precompiledLibIndexPath}/{url}");
                if (response.IsSuccessStatusCode)
                {
                    var dllBytes = await response.Content.ReadAsByteArrayAsync();
                    var reference = MetadataReference.CreateFromImage(dllBytes);
                    references.Add(reference);
                }
                else
                {
                    Logger.Error($"Failed to download {url}: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                Logger.Error($"Error fetching {url}: {ex.Message}");
            }
        }

        return references;
    }
}
