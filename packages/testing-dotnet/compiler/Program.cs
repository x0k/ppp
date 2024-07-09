using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices.JavaScript;
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
    public static void Main()
    {
        // Main method is required but can be empty
    }

    [JSExport]
    [RequiresUnreferencedCode("Calls System.AppDomain.Load(Byte[])")]
    internal static void Compile(string code)
    {
        SyntaxTree tree = CSharpSyntaxTree.ParseText(code);
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
            return;
        }
        var references = GetMetadataReferences();
        Logger.Debug($"References: {references.Count}");
        var op = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary).
            WithAssemblyIdentityComparer(DesktopAssemblyIdentityComparer.Default);
        var compilation = CSharpCompilation.Create("MyAssembly.Demo", [tree], references, op);

        using MemoryStream stream = new();
        var result = compilation.Emit(stream, options: new EmitOptions());

        foreach (var diagnostic in result.Diagnostics)
        {
            Logger.PrintDiagnostic(diagnostic);
        }

        if (!result.Success)
        {
            return;
        }

        var assembly = AppDomain.CurrentDomain.Load(stream.ToArray());
    }


    internal static List<MetadataReference> GetMetadataReferences()
    {
        var references = new List<MetadataReference>();

        foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
        {
            try
            {
                var reference = CreateMetadataReference(assembly);
                if (reference != null)
                {
                    references.Add(reference);
                }
            }
            catch (Exception ex)
            {
                Logger.Error($"Failed to add reference for {assembly.FullName}: {ex.Message}");
            }
        }

        return references;
    }

    internal static MetadataReference CreateMetadataReference(Assembly assembly)
    {
        return MetadataReference.CreateFromImage(GetAssemblyMetadata(assembly));
    }

    internal static byte[] GetAssemblyMetadata(Assembly assembly)
    {
        using var stream = new MemoryStream();
        using var writer = new BinaryWriter(stream);

        // Write the metadata directly
        writer.Write(assembly.FullName);
        foreach (var type in assembly.GetTypes())
        {
            writer.Write(type.FullName);
            foreach (var method in type.GetMethods())
            {
                writer.Write(method.Name);
            }
        }

        return stream.ToArray();
    }
}
