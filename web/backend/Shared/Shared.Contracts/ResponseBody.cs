namespace Shared.Contracts;

/// <summary>
///     Generic envelope used to wrap API responses that carry a data payload alongside a message.
/// </summary>
public record ResponseBody<T>
{
    public required string Message { get; init; }

    public required T Payload { get; init; }
}

/// <summary>
///     Envelope used to wrap API responses that carry only a message and no data payload.
/// </summary>
public record ResponseBody
{
    public required string Message { get; init; }
}
