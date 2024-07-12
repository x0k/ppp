export interface UsingOptions {
  serialization?: "" | true;
  additional?: string;
}

export interface ExecutionCodeOptions {
  executionCode: string;
  additionalDefinitions?: string;
  using?: UsingOptions;
  namespace?: string;
  className?: string;
  methodName?: string;
  args?: string;
  resultVar?: string;
  serializeCode?: string;
}

export function makeExecutionCode({
  executionCode,
  using: {
    serialization: serializationUsing = "",
    additional: additionalUsing = "",
  } = {},
  additionalDefinitions = "",
  namespace = "test",
  className = "Test",
  methodName = "Execute",
  args = "string jsonArguments",
  resultVar = "result",
  serializeCode = `return JsonSerializer.Serialize(${resultVar});`,
}: ExecutionCodeOptions) {
  return `using System.Text.Json;
${serializationUsing && "using System.Text.Json.Serialization;"}
using System.Diagnostics.CodeAnalysis;
${additionalUsing}

namespace ${namespace}
{
  ${additionalDefinitions.split("\n").join("\n  ")}
  public class ${className} {
    [RequiresUnreferencedCode("Calls System.Text.Json.JsonSerializer.Serialize<TValue>(TValue, JsonSerializerOptions)")]
    public static string ${methodName}(${args}) {
      ${executionCode.split("\n").join("\n      ")}
      ${serializeCode}
    }
  }
}
`;
}
