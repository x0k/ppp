export interface UsingOptions {
  /** @default true */
  serialization?: boolean;
  /** @default "" */
  additional?: string;
}

export interface ExecutionCodeOptions {
  executionCode: string;
  /** @default "" */
  additionalDefinitions?: string;
  /** @default {} */
  using?: UsingOptions;
  /** @default "test" */
  namespace?: string;
  /** @default "Test" */
  className?: string;
  /** @default "Execute" */
  methodName?: string;
  /** @default "string jsonArguments" */
  args?: string;
  /** @default "result" */
  resultVar?: string;
  /** @default `return JsonSerializer.Serialize(${resultVar});` */
  serializeCode?: string;
}

export function makeExecutionCode({
  executionCode,
  using: {
    serialization: serializationUsing = true,
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
${serializationUsing ? "using System.Text.Json.Serialization;" : ""}
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
