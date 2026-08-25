using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Domain.Exceptions;
using Features.Auth.Services;
using Features.Auth.Tests.TestSupport;
using FluentAssertions;
using Infrastructure.Jwt;
using Microsoft.Extensions.Configuration;
using Moq;

namespace Features.Auth.Tests.Services;

public class TokenServiceValidationTests
{
    private readonly Mock<ITokenInfrastructure> _tokenInfraMock;
    private readonly TokenService _tokenService;

    public TokenServiceValidationTests()
    {
        _tokenInfraMock = new Mock<ITokenInfrastructure>();

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["ACCESS_TOKEN_SECRET"] = "test-access-secret-that-is-very-long-1234567890",
                    ["REFRESH_TOKEN_SECRET"] = "test-refresh-secret-that-is-very-long-1234567890",
                    ["CONFIRMATION_TOKEN_SECRET"] =
                        "test-confirmation-secret-that-is-very-long-1234567890",
                }
            )
            .Build();

        _tokenService = new TokenService(
            _tokenInfraMock.Object,
            UserManagerMockFactory.Create().Object,
            configuration
        );
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_WithValidToken_ReturnsValidatedToken()
    {
        // Arrange
        Guid userId = Guid.NewGuid();
        const string username = "testuser";
        const string token = "valid-refresh-token";

        List<Claim> claims = new()
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        ClaimsIdentity claimsIdentity = new(claims);
        ClaimsPrincipal principal = new(claimsIdentity);

        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
            .ReturnsAsync(principal);

        // Act
        ValidatedToken result = await _tokenService.ValidateRefreshTokenAsync(token);

        // Assert
        result.Should().NotBeNull();
        result.UserId.Should().Be(userId);
        result.Username.Should().Be(username);
    }

    [Fact]
    public async Task ValidateConfirmationTokenAsync_WithValidToken_ReturnsValidatedToken()
    {
        // Arrange
        Guid userId = Guid.NewGuid();
        const string username = "testuser";
        const string token = "valid-confirmation-token";

        List<Claim> claims = new()
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        ClaimsIdentity claimsIdentity = new(claims);
        ClaimsPrincipal principal = new(claimsIdentity);

        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
            .ReturnsAsync(principal);

        // Act
        ValidatedToken result = await _tokenService.ValidateConfirmationTokenAsync(token);

        // Assert
        result.Should().NotBeNull();
        result.UserId.Should().Be(userId);
        result.Username.Should().Be(username);
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_WithExpiredToken_ThrowsUnauthorizedException()
    {
        // Arrange
        const string token = "expired-token";

        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
            .ThrowsAsync(new UnauthorizedException("Token has expired"));

        // Act & Assert
        await FluentActions
            .Invoking(async () => await _tokenService.ValidateRefreshTokenAsync(token))
            .Should()
            .ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_WithMissingUserIdClaim_ThrowsUnauthorizedException()
    {
        // Arrange
        const string username = "testuser";
        const string token = "token-without-user-id";

        // Claims without Sub (user ID)
        List<Claim> claims = new()
        {
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        ClaimsIdentity claimsIdentity = new(claims);
        ClaimsPrincipal principal = new(claimsIdentity);

        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
            .ReturnsAsync(principal);

        // Act & Assert
        await FluentActions
            .Invoking(async () => await _tokenService.ValidateRefreshTokenAsync(token))
            .Should()
            .ThrowAsync<UnauthorizedException>()
            .WithMessage("*missing required claims*");
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_WithMissingUsernameClaim_ThrowsUnauthorizedException()
    {
        // Arrange
        Guid userId = Guid.NewGuid();
        const string token = "token-without-username";

        // Claims without UniqueName (username)
        List<Claim> claims = new()
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        ClaimsIdentity claimsIdentity = new(claims);
        ClaimsPrincipal principal = new(claimsIdentity);

        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
            .ReturnsAsync(principal);

        // Act & Assert
        await FluentActions
            .Invoking(async () => await _tokenService.ValidateRefreshTokenAsync(token))
            .Should()
            .ThrowAsync<UnauthorizedException>()
            .WithMessage("*missing required claims*");
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_WithMalformedUserId_ThrowsUnauthorizedException()
    {
        // Arrange
        const string username = "testuser";
        const string token = "token-with-malformed-user-id";

        // Claims with invalid GUID format
        List<Claim> claims = new()
        {
            new Claim(JwtRegisteredClaimNames.Sub, "not-a-valid-guid"),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        ClaimsIdentity claimsIdentity = new(claims);
        ClaimsPrincipal principal = new(claimsIdentity);

        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
            .ReturnsAsync(principal);

        // Act & Assert
        await FluentActions
            .Invoking(async () => await _tokenService.ValidateRefreshTokenAsync(token))
            .Should()
            .ThrowAsync<UnauthorizedException>()
            .WithMessage("*malformed user ID*");
    }

    [Fact]
    public async Task ValidateRefreshTokenAsync_WithInvalidToken_ThrowsUnauthorizedException()
    {
        // Arrange
        const string token = "invalid-refresh-token";

        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
            .ThrowsAsync(new UnauthorizedException("Invalid token"));

        // Act & Assert
        await FluentActions
            .Invoking(async () => await _tokenService.ValidateRefreshTokenAsync(token))
            .Should()
            .ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task ValidateConfirmationTokenAsync_WithInvalidToken_ThrowsUnauthorizedException()
    {
        // Arrange
        const string token = "invalid-confirmation-token";

        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
            .ThrowsAsync(new UnauthorizedException("Invalid token"));

        // Act & Assert
        await FluentActions
            .Invoking(async () => await _tokenService.ValidateConfirmationTokenAsync(token))
            .Should()
            .ThrowAsync<UnauthorizedException>();
    }
}
