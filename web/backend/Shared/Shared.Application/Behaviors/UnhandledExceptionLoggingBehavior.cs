using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Shared.Application.Behaviors;

/// <summary>
///     MediatR pipeline behavior that logs unhandled exceptions together with the request type and
///     payload, then rethrows them unchanged for <c>GlobalExceptionFilter</c> to map to a status code.
/// </summary>
public class UnhandledExceptionLoggingBehavior<TRequest, TResponse>(
    ILogger<UnhandledExceptionLoggingBehavior<TRequest, TResponse>> logger
) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private static readonly string[] SensitiveFieldNames = ["password", "token"];

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        TypeInfoResolver = new DefaultJsonTypeInfoResolver
        {
            Modifiers = { RedactSensitiveProperties },
        },
    };

    /// <inheritdoc/>
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
            // Expected: ValidationBehavior already reports these as request errors, not incidents.
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Unhandled exception while processing {RequestName}: {RequestPayload}",
                typeof(TRequest).Name,
                Serialize(request)
            );
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
