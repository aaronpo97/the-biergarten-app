using System.Security.Claims;
using System.Text.Encodings.Web;
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
      // Get the JWT secret from configuration
      var secret = configuration["Jwt:SecretKey"]
          ?? throw new InvalidOperationException("JWT SecretKey is not configured");

      // Check if Authorization header exists
      if (!Request.Headers.TryGetValue("Authorization", out var authHeaderValue))
      {
         return AuthenticateResult.Fail("Authorization header is missing");
      }

      var authHeader = authHeaderValue.ToString();
      if (!authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
      {
         return AuthenticateResult.Fail("Invalid authorization header format");
      }

      var token = authHeader.Substring("Bearer ".Length).Trim();

      try
      {
         var claimsPrincipal = await tokenInfrastructure.ValidateJwtAsync(token, secret);
         var ticket = new AuthenticationTicket(claimsPrincipal, Scheme.Name);
         return AuthenticateResult.Success(ticket);
      }
      catch (Exception ex)
      {
         return AuthenticateResult.Fail($"Token validation failed: {ex.Message}");
      }
   }
}

public class JwtAuthenticationOptions : AuthenticationSchemeOptions
{
}
