using System.Security.Claims;
using System.Text.Encodings.Web;
using Infrastructure.Jwt;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using Shared.Contracts;

namespace API.Core.Authentication;

/// <summary>
///     Custom ASP.NET Core authentication handler that validates bearer JWT access tokens
///     supplied in the <c>Authorization</c> header against the <c>JWT</c> authentication scheme.
/// </summary>
public class JwtAuthenticationHandler(
    IOptionsMonitor<JwtAuthenticationOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    ITokenInfrastructure tokenInfrastructure,
    IConfiguration configuration
) : AuthenticationHandler<JwtAuthenticationOptions>(options, logger, encoder)
{
    /// <summary>
    ///     Validates the incoming request's bearer JWT access token and produces an authentication result.
    /// </summary>
    /// <remarks>
    ///     The signing secret is resolved first from the <c>ACCESS_TOKEN_SECRET</c> environment variable, falling
    ///     back to the <c>Jwt:SecretKey</c> configuration value, to stay consistent with the secret source used
    ///     when tokens are issued. Fails if the secret is not configured, the <c>Authorization</c> header is
    ///     missing or not <c>Bearer</c>-scheme, or the token fails validation.
    /// </remarks>
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Use the same access-token secret source as TokenService to avoid mismatched validation.
        string? secret = configuration["ACCESS_TOKEN_SECRET"];
        if (string.IsNullOrWhiteSpace(secret))
            secret = configuration["Jwt:SecretKey"];

        if (string.IsNullOrWhiteSpace(secret))
            return AuthenticateResult.Fail("JWT secret is not configured");

        // Check if Authorization header exists
        if (!Request.Headers.TryGetValue("Authorization", out StringValues authHeaderValue))
            return AuthenticateResult.Fail("Authorization header is missing");

        string authHeader = authHeaderValue.ToString();
        if (!authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return AuthenticateResult.Fail("Invalid authorization header format");

        string token = authHeader.Substring("Bearer ".Length).Trim();

        try
        {
            ClaimsPrincipal claimsPrincipal = await tokenInfrastructure.ValidateJwtAsync(
                token,
                secret
            );
            AuthenticationTicket ticket = new(claimsPrincipal, Scheme.Name);
            return AuthenticateResult.Success(ticket);
        }
        catch (Exception ex)
        {
            return AuthenticateResult.Fail($"Token validation failed: {ex.Message}");
        }
    }

    /// <summary>
    ///     Writes a JSON 401 Unauthorized response when authentication fails or is required but not supplied.
    /// </summary>
    protected override async Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.ContentType = "application/json";
        Response.StatusCode = 401;

        ResponseBody response = new()
        {
            Message = "Unauthorized: Invalid or missing authentication token",
        };
        await Response.WriteAsJsonAsync(response);
    }
}

/// <summary>
///     Options for the <c>JWT</c> authentication scheme handled by <see cref="JwtAuthenticationHandler" />.
/// </summary>
public class JwtAuthenticationOptions : AuthenticationSchemeOptions;
