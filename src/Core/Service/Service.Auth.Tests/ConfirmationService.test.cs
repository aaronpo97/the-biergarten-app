using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Domain.Entities;
using Domain.Exceptions;
using FluentAssertions;
using Infrastructure.Repository.Auth;
using Moq;

namespace Service.Auth.Tests;

public class ConfirmationServiceTest
{
   private readonly Mock<IAuthRepository> _authRepositoryMock;
   private readonly Mock<ITokenService> _tokenServiceMock;
   private readonly ConfirmationService _confirmationService;

   public ConfirmationServiceTest()
   {
      _authRepositoryMock = new Mock<IAuthRepository>();
      _tokenServiceMock = new Mock<ITokenService>();

      _confirmationService = new ConfirmationService(
          _authRepositoryMock.Object,
          _tokenServiceMock.Object
      );
   }

   [Fact]
   public async Task ConfirmUserAsync_WithValidConfirmationToken_ConfirmsUser()
   {
      // Arrange
      var userId = Guid.NewGuid();
      const string username = "testuser";
      const string confirmationToken = "valid-confirmation-token";

      var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

      var claimsIdentity = new ClaimsIdentity(claims);
      var principal = new ClaimsPrincipal(claimsIdentity);

      var validatedToken = new ValidatedToken(userId, username, principal);
      var userAccount = new UserAccount
      {
         UserAccountId = userId,
         Username = username,
         FirstName = "Test",
         LastName = "User",
         Email = "test@example.com",
         DateOfBirth = new DateTime(1990, 1, 1),
      };

      _tokenServiceMock
          .Setup(x => x.ValidateConfirmationTokenAsync(confirmationToken))
          .ReturnsAsync(validatedToken);

      _authRepositoryMock
          .Setup(x => x.ConfirmUserAccountAsync(userId))
          .ReturnsAsync(userAccount);

      // Act
      var result =
          await _confirmationService.ConfirmUserAsync(confirmationToken);

      // Assert
      result.Should().NotBeNull();
      result.userId.Should().Be(userId);
      result.confirmedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));

      _tokenServiceMock.Verify(
          x => x.ValidateConfirmationTokenAsync(confirmationToken),
          Times.Once
      );

      _authRepositoryMock.Verify(
          x => x.ConfirmUserAccountAsync(userId),
          Times.Once
      );
   }

   [Fact]
   public async Task ConfirmUserAsync_WithInvalidConfirmationToken_ThrowsUnauthorizedException()
   {
      // Arrange
      const string invalidToken = "invalid-confirmation-token";

      _tokenServiceMock
          .Setup(x => x.ValidateConfirmationTokenAsync(invalidToken))
          .ThrowsAsync(new UnauthorizedException(
              "Invalid confirmation token"
          ));

      // Act & Assert
      await FluentActions.Invoking(async () =>
          await _confirmationService.ConfirmUserAsync(invalidToken)
      ).Should().ThrowAsync<UnauthorizedException>();
   }

   [Fact]
   public async Task ConfirmUserAsync_WithExpiredConfirmationToken_ThrowsUnauthorizedException()
   {
      // Arrange
      const string expiredToken = "expired-confirmation-token";

      _tokenServiceMock
          .Setup(x => x.ValidateConfirmationTokenAsync(expiredToken))
          .ThrowsAsync(new UnauthorizedException(
              "Confirmation token has expired"
          ));

      // Act & Assert
      await FluentActions.Invoking(async () =>
          await _confirmationService.ConfirmUserAsync(expiredToken)
      ).Should().ThrowAsync<UnauthorizedException>();
   }

   [Fact]
   public async Task ConfirmUserAsync_WithNonExistentUser_ThrowsUnauthorizedException()
   {
      // Arrange
      var userId = Guid.NewGuid();
      const string username = "nonexistent";
      const string confirmationToken = "valid-token-for-nonexistent-user";

      var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

      var claimsIdentity = new ClaimsIdentity(claims);
      var principal = new ClaimsPrincipal(claimsIdentity);

      var validatedToken = new ValidatedToken(userId, username, principal);

      _tokenServiceMock
          .Setup(x => x.ValidateConfirmationTokenAsync(confirmationToken))
          .ReturnsAsync(validatedToken);

      _authRepositoryMock
          .Setup(x => x.ConfirmUserAccountAsync(userId))
          .ReturnsAsync((UserAccount?)null);

      // Act & Assert
      await FluentActions.Invoking(async () =>
          await _confirmationService.ConfirmUserAsync(confirmationToken)
      ).Should().ThrowAsync<UnauthorizedException>()
          .WithMessage("*User account not found*");
   }
}
