using Microsoft.JSInterop;

namespace Adapters.Js
{
  public struct Result
  {
    private bool ok;
    private IJSObjectReference value;
    private IJSObjectReference error;

    public static Result Ok(IJSObjectReference value)
    {
      return new Result
      {
        ok = true,
        value = value
      };
    }

    public static Result Err(IJSObjectReference error)
    {
      return new Result
      {
        ok = false,
        error = error
      };
    }

    public static Result FromJsValue(IJSObjectReference value)
    {
      value.
    }

  }
}
