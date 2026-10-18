using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Shared.Application.Behaviors;

/// <summary>
///     MediatR pipeline behavior that times each request and logs a warning when
///     handling takes at least <see cref="PerformanceLoggingOptions.SlowRequestThresholdMs" />.
///     Exceptions from the handler propagate unchanged.
/// </summary>
public partial class PerformanceLoggingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<PerformanceLoggingBehavior<TRequest, TResponse>> _logger;
    private readonly IOptionsMonitor<PerformanceLoggingOptions> _options;

    public PerformanceLoggingBehavior(
        ILogger<PerformanceLoggingBehavior<TRequest, TResponse>> logger,
        IOptionsMonitor<PerformanceLoggingOptions> options
    )
    {
        _logger = logger;
        _options = options;
    }

    /// <inheritdoc />
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken
    )
    {
        long start = Stopwatch.GetTimestamp();
        try
        {
            return await next(cancellationToken);
        }
        finally
        {
            TimeSpan elapsed = Stopwatch.GetElapsedTime(start);
            int thresholdMs = _options.CurrentValue.SlowRequestThresholdMs;

            if (elapsed.TotalMilliseconds >= thresholdMs)
                LogSlowRequest(typeof(TRequest).Name, (long)elapsed.TotalMilliseconds, thresholdMs);
        }
    }

    [LoggerMessage(
        Level = LogLevel.Warning,
        Message = "Slow request {RequestName} took {ElapsedMs}ms (threshold {ThresholdMs}ms)"
    )]
    private partial void LogSlowRequest(string requestName, long elapsedMs, int thresholdMs);
}
