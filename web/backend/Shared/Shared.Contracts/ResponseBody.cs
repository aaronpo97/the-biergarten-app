namespace Shared.Contracts;

/// <summary>
///     Generic envelope used to wrap API responses that carry a data payload alongside a message.
/// </summary>
public record ResponseBody<T>
{
    /// <summary>Gets the human-readable message describing the response.</summary>
    public required string Message { get; init; }

    /// <summary>Gets the response's data payload.</summary>
    public required T Payload { get; init; }
}

/// <summary>
///     Envelope used to wrap API responses that carry only a message and no data payload.
/// </summary>
public record ResponseBody
{
    /// <summary>Gets the human-readable message describing the response.</summary>
    public required string Message { get; init; }
}
