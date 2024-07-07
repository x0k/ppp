using Compiler;
using Microsoft.JSInterop;
using Newtonsoft.Json;

namespace Adapters.Js
{
  public class Result<T, E> : IResult<T, E>
  {
    [JsonProperty("ok")]
    private readonly bool ok;

    [JsonProperty("value")]
    private readonly T value;

    [JsonProperty("error")]
    private readonly E error;

    public bool IsOk { get => ok; }
    public T Value { get => value; }
    public E Error { get => error; }
  }

  public class Writer(IJSObjectReference writer) : IWriter
  {

    private readonly IJSObjectReference _writer = writer;

    public IResult<int, int> Write(byte[] data)
    {
      var task = _writer.InvokeAsync<Result<int, int>>("write", data).AsTask();
      task.Wait();
      return task.Result;
    }
  }
}