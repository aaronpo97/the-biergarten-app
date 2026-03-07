using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Domain.Entities;
using Domain.Exceptions;
using FluentAssertions;
using Infrastructure.Jwt;
using Infrastructure.Repository.Auth;
using Moq;

namespace Service.Auth.Tests;

public class TokenServiceRefreshTest
{
   private readonly Mock<ITokenInfrastructure> _tokenInfraMock;
   private readonly Mock<IAuthRepository> _authRepositoryMock;
   private readonly TokenService _tokenService;

   public TokenServiceRefreshTest()
   {
      _tokenInfraMock = new Mock<ITokenInfrastructure>();
      _authRepositoryMock = new Mock<IAuthRepository>();

      // Set environment variables for tokens
      Environment.SetEnvironmentVariable("ACCESS_TOKEN_SECRET", "test-access-secret-that-is-very-long-1234567890");
      Environment.SetEnvironmentVariable("REFRESH_TOKEN_SECRET", "test-refresh-secret-that-is-very-long-1234567890");
      Environment.SetEnvironmentVariable("CONFIRMATION_TOKEN_SECRET", "test-confirmation-secret-that-is-very-long-1234567890");

      _tokenService = new TokenService(
          _tokenInfraMock.Object,
          _authRepositoryMock.Object
      );
   }

   [Fact]
   public async Task RefreshTokenAsync_WithValidRefreshToken_ReturnsNewTokens()
   {
      // Arrange
      var userId = Guid.NewGuid();
      const string username = "testuser";
      const string refreshToken = "valid-refresh-token";

      var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

      var claimsIdentity = new ClaimsIdentity(claims);
      var principal = new ClaimsPrincipal(claimsIdentity);

      var userAccount = new UserAccount
      {
         UserAccountId = userId,
         Username = username,
         FirstName = "Test",
         LastName = "User",
         Email = "test@example.com",
         DateOfBirth = new DateTime(1990, 1, 1),
      };

      // Mock the validation of refresh token
      _tokenInfraMock
          .Setup(x => x.ValidateJwtAsync(refreshToken, It.IsAny<string>()))
          .ReturnsAsync(principal);

      // Mock the generation of new tokens
      _tokenInfraMock
          .Setup(x => x.GenerateJwt(userId, username, It.IsAny<DateTime>(), It.IsAny<string>()))
          .Returns((Guid _, string _, DateTime _, string _) => $"generated-token-{Guid.NewGuid()}");

      _authRepositoryMock
          .Setup(x => x.GetUserByIdAsync(userId))
          .ReturnsAsync(userAccount);

      // Act
      var result = await _tokenService.RefreshTokenAsync(refreshToken);

      // Assert
      result.Should().NotBeNull();
      result.UserAccount.UserAccountId.Should().Be(userId);
      result.UserAccount.Username.Should().Be(username);
      result.AccessToken.Should().NotBeEmpty();
      result.RefreshToken.Should().NotBeEmpty();

      _authRepositoryMock.Verify(
          x => x.GetUserByIdAsync(userId),
          Times.Once
      );

      // Verify tokens were generated (called twice - once for access, once for refresh)
      _tokenInfraMock.Verify(
          x => x.GenerateJwt(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<DateTime>(), It.IsAny<string>()),
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
      await FluentActions.Invoking(async () =>
          await _tokenService.RefreshTokenAsync(invalidToken)
      ).Should().ThrowAsync<UnauthorizedException>();
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
      await FluentActions.Invoking(async () =>
          await _tokenService.RefreshTokenAsync(expiredToken)
      ).Should().ThrowAsync<UnauthorizedException>();
   }

   [Fact]
   public async Task RefreshTokenAsync_WithNonExistentUser_ThrowsUnauthorizedException()
   {
      // Arrange
      var userId = Guid.NewGuid();
      const string username = "testuser";
      const string refreshToken = "valid-refresh-token";

      var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

      var claimsIdentity = new ClaimsIdentity(claims);
      var principal = new ClaimsPrincipal(claimsIdentity);

      _tokenInfraMock
          .Setup(x => x.ValidateJwtAsync(refreshToken, It.IsAny<string>()))
          .ReturnsAsync(principal);

      _authRepositoryMock
          .Setup(x => x.GetUserByIdAsync(userId))
          .ReturnsAsync((UserAccount?)null);

      // Act & Assert
      await FluentActions.Invoking(async () =>
          await _tokenService.RefreshTokenAsync(refreshToken)
      ).Should().ThrowAsync<UnauthorizedException>()
          .WithMessage("*User account not found*");
   }
}
