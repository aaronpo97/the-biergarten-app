using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Domain.Entities;
using Domain.Exceptions;
using FluentAssertions;
using Infrastructure.Jwt;
using Infrastructure.Repository.Auth;
using Moq;

namespace Service.Auth.Tests;

public class TokenServiceValidationTest
{
   private readonly Mock<ITokenInfrastructure> _tokenInfraMock;
   private readonly Mock<IAuthRepository> _authRepositoryMock;
   private readonly TokenService _tokenService;

   public TokenServiceValidationTest()
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
   public async Task ValidateAccessTokenAsync_WithValidToken_ReturnsValidatedToken()
   {
      // Arrange
      var userId = Guid.NewGuid();
      const string username = "testuser";
      const string token = "valid-access-token";

      var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

      var claimsIdentity = new ClaimsIdentity(claims);
      var principal = new ClaimsPrincipal(claimsIdentity);

      _tokenInfraMock
          .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
          .ReturnsAsync(principal);

      // Act
      var result =
          await _tokenService.ValidateAccessTokenAsync(token);

      // Assert
      result.Should().NotBeNull();
      result.UserId.Should().Be(userId);
      result.Username.Should().Be(username);
      result.Principal.Should().NotBeNull();
      result.Principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value.Should().Be(userId.ToString());
   }

   [Fact]
   public async Task ValidateRefreshTokenAsync_WithValidToken_ReturnsValidatedToken()
   {
      // Arrange
      var userId = Guid.NewGuid();
      const string username = "testuser";
      const string token = "valid-refresh-token";

      var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

      var claimsIdentity = new ClaimsIdentity(claims);
      var principal = new ClaimsPrincipal(claimsIdentity);

      _tokenInfraMock
          .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
          .ReturnsAsync(principal);

      // Act
      var result =
          await _tokenService.ValidateRefreshTokenAsync(token);

      // Assert
      result.Should().NotBeNull();
      result.UserId.Should().Be(userId);
      result.Username.Should().Be(username);
   }

   [Fact]
   public async Task ValidateConfirmationTokenAsync_WithValidToken_ReturnsValidatedToken()
   {
      // Arrange
      var userId = Guid.NewGuid();
      const string username = "testuser";
      const string token = "valid-confirmation-token";

      var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

      var claimsIdentity = new ClaimsIdentity(claims);
      var principal = new ClaimsPrincipal(claimsIdentity);

      _tokenInfraMock
          .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
          .ReturnsAsync(principal);

      // Act
      var result =
          await _tokenService.ValidateConfirmationTokenAsync(token);

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
      await FluentActions.Invoking(async () =>
          await _tokenService.ValidateAccessTokenAsync(token)
      ).Should().ThrowAsync<UnauthorizedException>();
   }

   [Fact]
   public async Task ValidateAccessTokenAsync_WithExpiredToken_ThrowsUnauthorizedException()
   {
      // Arrange
      const string token = "expired-token";

      _tokenInfraMock
          .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
          .ThrowsAsync(new UnauthorizedException(
              "Token has expired"
          ));

      // Act & Assert
      await FluentActions.Invoking(async () =>
          await _tokenService.ValidateAccessTokenAsync(token)
      ).Should().ThrowAsync<UnauthorizedException>();
   }

   [Fact]
   public async Task ValidateAccessTokenAsync_WithMissingUserIdClaim_ThrowsUnauthorizedException()
   {
      // Arrange
      const string username = "testuser";
      const string token = "token-without-user-id";

      // Claims without Sub (user ID)
      var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

      var claimsIdentity = new ClaimsIdentity(claims);
      var principal = new ClaimsPrincipal(claimsIdentity);

      _tokenInfraMock
          .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
          .ReturnsAsync(principal);

      // Act & Assert
      await FluentActions.Invoking(async () =>
          await _tokenService.ValidateAccessTokenAsync(token)
      ).Should().ThrowAsync<UnauthorizedException>()
          .WithMessage("*missing required claims*");
   }

   [Fact]
   public async Task ValidateAccessTokenAsync_WithMissingUsernameClaim_ThrowsUnauthorizedException()
   {
      // Arrange
      var userId = Guid.NewGuid();
      const string token = "token-without-username";

      // Claims without UniqueName (username)
      var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

      var claimsIdentity = new ClaimsIdentity(claims);
      var principal = new ClaimsPrincipal(claimsIdentity);

      _tokenInfraMock
          .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
          .ReturnsAsync(principal);

      // Act & Assert
      await FluentActions.Invoking(async () =>
          await _tokenService.ValidateAccessTokenAsync(token)
      ).Should().ThrowAsync<UnauthorizedException>()
          .WithMessage("*missing required claims*");
   }

   [Fact]
   public async Task ValidateAccessTokenAsync_WithMalformedUserId_ThrowsUnauthorizedException()
   {
      // Arrange
      const string username = "testuser";
      const string token = "token-with-malformed-user-id";

      // Claims with invalid GUID format
      var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, "not-a-valid-guid"),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

      var claimsIdentity = new ClaimsIdentity(claims);
      var principal = new ClaimsPrincipal(claimsIdentity);

      _tokenInfraMock
          .Setup(x => x.ValidateJwtAsync(token, It.IsAny<string>()))
          .ReturnsAsync(principal);

      // Act & Assert
      await FluentActions.Invoking(async () =>
          await _tokenService.ValidateAccessTokenAsync(token)
      ).Should().ThrowAsync<UnauthorizedException>()
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
      await FluentActions.Invoking(async () =>
          await _tokenService.ValidateRefreshTokenAsync(token)
      ).Should().ThrowAsync<UnauthorizedException>();
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
      await FluentActions.Invoking(async () =>
          await _tokenService.ValidateConfirmationTokenAsync(token)
      ).Should().ThrowAsync<UnauthorizedException>();
   }
}
