namespace API.Core.Contracts.Common;

public record ResponseBody<T>
{
    public required string Message { get; init; }
    public required T Payload { get; init; }
}

public record ResponseBody
{
    public required string Message { get; init; }
}
