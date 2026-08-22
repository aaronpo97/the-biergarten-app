using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Domain.Exceptions;
using Features.Auth.Repository;
using Features.Auth.Services;
using FluentAssertions;
using Infrastructure.Jwt;
using Moq;

namespace Features.Auth.Tests.Services;

public class TokenServiceValidationTests
{
    private readonly Mock<ITokenInfrastructure> _tokenInfraMock;
    private readonly TokenService _tokenService;

    public TokenServiceValidationTests()
    {
        _tokenInfraMock = new Mock<ITokenInfrastructure>();

        // Set environment variables for tokens
        Environment.SetEnvironmentVariable(
            "ACCESS_TOKEN_SECRET",
            "test-access-secret-that-is-very-long-1234567890"
        );
        Environment.SetEnvironmentVariable(
            "REFRESH_TOKEN_SECRET",
            "test-refresh-secret-that-is-very-long-1234567890"
        );
        Environment.SetEnvironmentVariable(
            "CONFIRMATION_TOKEN_SECRET",
            "test-confirmation-secret-that-is-very-long-1234567890"
        );

        _tokenService = new TokenService(_tokenInfraMock.Object, new Mock<IAuthRepository>().Object);
    }

    [Fact]
    public async Task ValidateAccessTokenAsync_WithValidToken_ReturnsValidatedToken()
    {
        // Arrange
        Guid userId = Guid.NewGuid();
        const string username = "testuser";
        const string token = "valid-access-token";

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
        ValidatedToken result = await _tokenService.ValidateAccessTokenAsync(token);

        // Assert
        result.Should().NotBeNull();
        result.UserId.Should().Be(userId);
        result.Username.Should().Be(username);
        result.Principal.Should().NotBeNull();
        result
            .Principal.FindFirst(JwtRegisteredClaimNames.Sub)
            ?.Value.Should()
            .Be(userId.ToString());
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
    public async Task ValidateAccessTokenAsync_WithInvalidToken_ThrowsUnauthorizedException()
    {
        // Arrange
        const string token = "invalid-token";

        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
            .ThrowsAsync(new UnauthorizedException("Invalid token"));

        // Act & Assert
        await FluentActions
            .Invoking(async () => await _tokenService.ValidateAccessTokenAsync(token))
            .Should()
            .ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task ValidateAccessTokenAsync_WithExpiredToken_ThrowsUnauthorizedException()
    {
        // Arrange
        const string token = "expired-token";

        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
            .ThrowsAsync(new UnauthorizedException("Token has expired"));

        // Act & Assert
        await FluentActions
            .Invoking(async () => await _tokenService.ValidateAccessTokenAsync(token))
            .Should()
            .ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task ValidateAccessTokenAsync_WithMissingUserIdClaim_ThrowsUnauthorizedException()
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
            .Invoking(async () => await _tokenService.ValidateAccessTokenAsync(token))
            .Should()
            .ThrowAsync<UnauthorizedException>()
            .WithMessage("*missing required claims*");
    }

    [Fact]
    public async Task ValidateAccessTokenAsync_WithMissingUsernameClaim_ThrowsUnauthorizedException()
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
            .Invoking(async () => await _tokenService.ValidateAccessTokenAsync(token))
            .Should()
            .ThrowAsync<UnauthorizedException>()
            .WithMessage("*missing required claims*");
    }

    [Fact]
    public async Task ValidateAccessTokenAsync_WithMalformedUserId_ThrowsUnauthorizedException()
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
            .Invoking(async () => await _tokenService.ValidateAccessTokenAsync(token))
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
