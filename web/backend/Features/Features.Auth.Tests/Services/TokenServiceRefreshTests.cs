using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Domain.Exceptions;
using Features.Auth.Identity;
using Features.Auth.Services;
using Features.Auth.Tests.TestSupport;
using FluentAssertions;
using Infrastructure.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Moq;

namespace Features.Auth.Tests.Services;

public class TokenServiceRefreshTests
{
    private readonly Mock<ITokenInfrastructure> _tokenInfraMock;
    private readonly TokenService _tokenService;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;

    public TokenServiceRefreshTests()
    {
        _tokenInfraMock = new Mock<ITokenInfrastructure>();
        _userManagerMock = UserManagerMockFactory.Create();

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
            _userManagerMock.Object,
            configuration
        );
    }

    [Fact]
    public async Task RefreshTokenAsync_WithValidRefreshToken_ReturnsNewTokens()
    {
        // Arrange
        Guid userId = Guid.NewGuid();
        const string username = "testuser";
        const string refreshToken = "valid-refresh-token";

        List<Claim> claims = new()
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        ClaimsIdentity claimsIdentity = new(claims);
        ClaimsPrincipal principal = new(claimsIdentity);

        ApplicationUser user = new() { Id = userId, UserName = username };

        // Mock the validation of refresh token
        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(refreshToken, It.IsAny<string>()))
            .ReturnsAsync(principal);

        // Mock the generation of new tokens
        _tokenInfraMock
            .Setup(x => x.GenerateJwt(userId, username, It.IsAny<DateTime>(), It.IsAny<string>()))
            .Returns(
                (Guid _, string _, DateTime _, string _) => $"generated-token-{Guid.NewGuid()}"
            );

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString())).ReturnsAsync(user);

        // Act
        RefreshTokenResult result = await _tokenService.RefreshTokenAsync(refreshToken);

        // Assert
        result.Should().NotBeNull();
        result.UserId.Should().Be(userId);
        result.Username.Should().Be(username);
        result.AccessToken.Should().NotBeEmpty();
        result.RefreshToken.Should().NotBeEmpty();

        _userManagerMock.Verify(x => x.FindByIdAsync(userId.ToString()), Times.Once);

        // Verify tokens were generated (called twice - once for access, once for refresh)
        _tokenInfraMock.Verify(
            x =>
                x.GenerateJwt(
                    It.IsAny<Guid>(),
                    It.IsAny<string>(),
                    It.IsAny<DateTime>(),
                    It.IsAny<string>()
                ),
            Times.Exactly(2)
        );
    }

    [Fact]
    public async Task RefreshTokenAsync_WithInvalidRefreshToken_ThrowsUnauthorizedException()
    {
        // Arrange
        const string invalidToken = "invalid-refresh-token";

        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(invalidToken, It.IsAny<string>()))
            .ThrowsAsync(new UnauthorizedException("Invalid refresh token"));

        // Act & Assert
        await FluentActions
            .Invoking(async () => await _tokenService.RefreshTokenAsync(invalidToken))
            .Should()
            .ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task RefreshTokenAsync_WithExpiredRefreshToken_ThrowsUnauthorizedException()
    {
        // Arrange
        const string expiredToken = "expired-refresh-token";

        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(expiredToken, It.IsAny<string>()))
            .ThrowsAsync(new UnauthorizedException("Refresh token has expired"));

        // Act & Assert
        await FluentActions
            .Invoking(async () => await _tokenService.RefreshTokenAsync(expiredToken))
            .Should()
            .ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task RefreshTokenAsync_WithNonExistentUser_ThrowsUnauthorizedException()
    {
        // Arrange
        Guid userId = Guid.NewGuid();
        const string username = "testuser";
        const string refreshToken = "valid-refresh-token";

        List<Claim> claims = new()
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        ClaimsIdentity claimsIdentity = new(claims);
        ClaimsPrincipal principal = new(claimsIdentity);

        _tokenInfraMock
            .Setup(x => x.ValidateJwtAsync(refreshToken, It.IsAny<string>()))
            .ReturnsAsync(principal);

        _userManagerMock
            .Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((ApplicationUser?)null);

        // Act & Assert
        await FluentActions
            .Invoking(async () => await _tokenService.RefreshTokenAsync(refreshToken))
            .Should()
            .ThrowAsync<UnauthorizedException>()
            .WithMessage("*User account not found*");
    }
}
