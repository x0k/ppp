namespace Compiler
{
  public interface IResult<T, E>
  {
    protected bool IsOk { get; }
    public T Value { get; }
    public E Error { get; }
  }

  public interface IWriter
  {
    IResult<int, int> Write(byte[] data);
  }
}
