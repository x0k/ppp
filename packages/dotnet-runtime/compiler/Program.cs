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

    public static void Log(DiagnosticSeverity severity, string message)
    {
        switch (severity)
        {
            case DiagnosticSeverity.Hidden:
                Debug(message);
                break;
            case DiagnosticSeverity.Info:
                Info(message);
                break;
            case DiagnosticSeverity.Warning:
                Warn(message);
                break;
            case DiagnosticSeverity.Error:
                Error(message);
                break;
        }
    }

    public static void Diagnostic(Diagnostic diagnostic)
    {
        Log(diagnostic.Severity, diagnostic.ToString());
    }
}

class BufferedLogger
{
    private List<(DiagnosticSeverity, string)> log = new();

    public void Debug(string message)
    {
        log.Add((DiagnosticSeverity.Hidden, message));
    }

    public void Info(string message)
    {
        log.Add((DiagnosticSeverity.Info, message));
    }

    public void Warn(string message)
    {
        log.Add((DiagnosticSeverity.Warning, message));
    }

    public void Error(string message)
    {
        log.Add((DiagnosticSeverity.Error, message));
    }

    public void Diagnostic(Diagnostic diagnostic)
    {
        log.Add((diagnostic.Severity, diagnostic.ToString()));
    }

    public void Print()
    {
        foreach (var log in log)
        {
            Logger.Log(log.Item1, log.Item2);
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
        var log = new BufferedLogger();
        try
        {
            references = await LoadMetadataReferences(log, precompiledLibIndexPath, dlls);
            return 0;
        }
        finally
        {
            log.Print();
        }
    }

    [JSExport]
    [RequiresUnreferencedCode("Calls System.AppDomain.Load(Byte[])")]
    internal static async Task<int> Compile(string[] code)
    {
        var log = new BufferedLogger();
        try
        {
            return await Task.Run(() =>
            {
                if (references == null)
                {
                    log.Error("Compiler is not initialized");
                    return -1;
                }
                SyntaxTree[] trees = new SyntaxTree[code.Length];
                for (int i = 0; i < code.Length; i++)
                {
                    SyntaxTree tree = CSharpSyntaxTree.ParseText(code[i]);
                    var hasDiagnosticError = false;
                    foreach (var diagnostic in tree.GetDiagnostics())
                    {
                        log.Diagnostic(diagnostic);
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
                    log.Diagnostic(diagnostic);
                }

                if (!result.Success)
                {
                    return -1;
                }

                assembly = AppDomain.CurrentDomain.Load(stream.ToArray());
                return 0;
            });
        }
        finally
        {
            log.Print();
        }
    }

    [JSExport]
    [RequiresUnreferencedCode("Calls System.Reflection.Assembly.GetExportedTypes()")]
    internal static async Task<int> Run(string typeFullName, string methodName, string[] arguments)
    {
        var log = new BufferedLogger();
        try
        {
            return await Task.Run(() =>
            {
                if (assembly == null)
                {
                    log.Error("There are no compiled assemblies");
                    return -1;
                }
                var type = assembly.GetExportedTypes().ToList().Find(x => x.FullName == typeFullName);
                if (type == null)
                {
                    log.Error($"Type not found: {typeFullName}");
                    return -1;
                }
                var method = type.GetMethod(methodName);
                if (method == null)
                {
                    log.Error($"Method not found: {methodName}");
                    return -1;
                }
                executionResult = method.Invoke(null, arguments);
                return 0;
            });
        }
        finally
        {
            log.Print();
        }
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
    internal static void DisposeAssembly()
    {
        assembly = null;
        executionResult = null;
    }

    internal static async Task<List<MetadataReference>> LoadMetadataReferences(BufferedLogger log, string precompiledLibIndexPath, string[] dlls)
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
                    log.Error($"Failed to download {url}: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                log.Error($"Error fetching {url}: {ex.Message}");
            }
        }

        return references;
    }
}
