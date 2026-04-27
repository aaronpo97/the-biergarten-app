using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Json;
using API.Core.Contracts.Common;
using Infrastructure.Jwt;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace API.Core.Authentication;

public class JwtAuthenticationHandler(
    IOptionsMonitor<JwtAuthenticationOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    ITokenInfrastructure tokenInfrastructure,
    IConfiguration configuration
) : AuthenticationHandler<JwtAuthenticationOptions>(options, logger, encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Use the same access-token secret source as TokenService to avoid mismatched validation.
        var secret = Environment.GetEnvironmentVariable("ACCESS_TOKEN_SECRET");
        if (string.IsNullOrWhiteSpace(secret))
        {
            secret = configuration["Jwt:SecretKey"];
        }

        if (string.IsNullOrWhiteSpace(secret))
        {
            return AuthenticateResult.Fail("JWT secret is not configured");
        }

        // Check if Authorization header exists
        if (
            !Request.Headers.TryGetValue(
                "Authorization",
                out var authHeaderValue
            )
        )
        {
            return AuthenticateResult.Fail("Authorization header is missing");
        }

        var authHeader = authHeaderValue.ToString();
        if (
            !authHeader.StartsWith(
                "Bearer ",
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            return AuthenticateResult.Fail(
                "Invalid authorization header format"
            );
        }

        var token = authHeader.Substring("Bearer ".Length).Trim();

        try
        {
            var claimsPrincipal = await tokenInfrastructure.ValidateJwtAsync(
                token,
                secret
            );
            var ticket = new AuthenticationTicket(claimsPrincipal, Scheme.Name);
            return AuthenticateResult.Success(ticket);
        }
        catch (Exception ex)
        {
            return AuthenticateResult.Fail(
                $"Token validation failed: {ex.Message}"
            );
        }
    }

    protected override async Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.ContentType = "application/json";
        Response.StatusCode = 401;

        var response = new ResponseBody { Message = "Unauthorized: Invalid or missing authentication token" };
        await Response.WriteAsJsonAsync(response);
    }
}

public class JwtAuthenticationOptions : AuthenticationSchemeOptions { }
