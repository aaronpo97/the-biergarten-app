using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Shared.Application.Behaviors;

public abstract class JsonLogger
{
    private static readonly string[] SensitiveFieldNames = ["password", "token"];

    protected static readonly JsonSerializerOptions SerializerOptions = new()
    {
        TypeInfoResolver = new DefaultJsonTypeInfoResolver
        {
            Modifiers = { RedactSensitiveProperties },
        },
    };

    private static void RedactSensitiveProperties(JsonTypeInfo typeInfo)
    {
        if (typeInfo.Kind != JsonTypeInfoKind.Object)
            return;

        foreach (JsonPropertyInfo property in typeInfo.Properties)
        {
            if (property.PropertyType != typeof(string))
                continue;

            if (
                SensitiveFieldNames.Any(name =>
                    property.Name.Contains(name, StringComparison.OrdinalIgnoreCase)
                )
            )
                property.Get = static _ => "***REDACTED***";
        }
    }
}

/// <summary>
///     MediatR pipeline behavior that logs unhandled exceptions together with the
///     request type and
///     payload, then rethrows them unchanged for <c>GlobalExceptionFilter</c> to
///     map to a status code.
/// </summary>
public partial class UnhandledExceptionLoggingBehavior<TRequest, TResponse>
    : JsonLogger,
        IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<UnhandledExceptionLoggingBehavior<TRequest, TResponse>> _logger;

    public UnhandledExceptionLoggingBehavior(
        ILogger<UnhandledExceptionLoggingBehavior<TRequest, TResponse>> logger
    )
    {
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken
    )
    {
        try
        {
            return await next();
        }
        catch (ValidationException)
        {
            // Expected: ValidationBehavior already reports these as request errors
            throw;
        }
        catch (Exception ex)
        {
            if (_logger.IsEnabled(LogLevel.Error))
                LogUnhandledException(ex, typeof(TRequest).Name, Serialize(request));
            
            throw;
        }
    }

    private static string Serialize(TRequest request)
    {
        try
        {
            return JsonSerializer.Serialize(request, SerializerOptions);
        }
        catch (Exception)
        {
            return "<unable to serialize request payload>";
        }
    }

    [LoggerMessage(
        Level = LogLevel.Error,
        Message = "Unhandled exception while processing {RequestName}: {RequestPayload}"
    )]
    private partial void LogUnhandledException(
        Exception ex,
        string requestName,
        string requestPayload
    );
}
