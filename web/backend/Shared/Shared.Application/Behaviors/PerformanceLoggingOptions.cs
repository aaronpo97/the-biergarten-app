namespace Shared.Application.Behaviors;

/// <summary>
///     Settings for <see cref="PerformanceLoggingBehavior{TRequest,TResponse}" />,
///     bound from the <c>PerformanceLogging</c> configuration section.
/// </summary>
public sealed class PerformanceLoggingOptions
{
    public const string SectionName = "PerformanceLogging";

    /// <summary>
    ///     Requests that take at least this many milliseconds are logged as slow.
    /// </summary>
    public int SlowRequestThresholdMs { get; set; } = 500;
}
