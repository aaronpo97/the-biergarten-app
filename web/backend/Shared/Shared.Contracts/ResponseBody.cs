namespace Shared.Contracts;

/// <summary>
/// Generic envelope used to wrap API responses that carry a data payload alongside a human-readable message.
/// </summary>
/// <typeparam name="T">The type of the data payload returned in the response.</typeparam>
public record ResponseBody<T>
{
    /// <summary>
    /// A human-readable message describing the outcome of the request.
    /// </summary>
    public required string Message { get; init; }

    /// <summary>
    /// The data payload associated with the response.
    /// </summary>
    public required T Payload { get; init; }
}

/// <summary>
/// Envelope used to wrap API responses that carry only a human-readable message and no data payload.
/// </summary>
public record ResponseBody
{
    /// <summary>
    /// A human-readable message describing the outcome of the request.
    /// </summary>
    public required string Message { get; init; }
}
