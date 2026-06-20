using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Domain.Entities;
using Domain.Exceptions;
using FluentAssertions;
using Features.Auth.Commands.ConfirmUser;
using Features.Auth.Repository;
using Features.Auth.Services;
using Moq;

namespace Features.Auth.Tests.Commands;

public class ConfirmUserHandlerTests
{
    private readonly Mock<IAuthRepository> _authRepositoryMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly ConfirmUserHandler _handler;

    public ConfirmUserHandlerTests()
    {
        _authRepositoryMock = new Mock<IAuthRepository>();
        _tokenServiceMock = new Mock<ITokenService>();
        _handler = new ConfirmUserHandler(_authRepositoryMock.Object, _tokenServiceMock.Object);
    }

    private static ValidatedToken MakeValidatedToken(Guid userId, string username)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims));
        return new ValidatedToken(userId, username, principal);
    }

    [Fact]
    public async Task Handle_WithValidConfirmationToken_ConfirmsUser()
    {
        var userId = Guid.NewGuid();
        const string username = "testuser";
        const string confirmationToken = "valid-confirmation-token";

        var validatedToken = MakeValidatedToken(userId, username);
        var userAccount = new UserAccount { UserAccountId = userId, Username = username };

        _tokenServiceMock.Setup(x => x.ValidateConfirmationTokenAsync(confirmationToken)).ReturnsAsync(validatedToken);
        _authRepositoryMock.Setup(x => x.ConfirmUserAccountAsync(userId)).ReturnsAsync(userAccount);

        var result = await _handler.Handle(new ConfirmUserCommand(confirmationToken), CancellationToken.None);

        result.Should().NotBeNull();
        result.UserAccountId.Should().Be(userId);
        result.ConfirmedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task Handle_WithInvalidConfirmationToken_ThrowsUnauthorizedException()
    {
        const string invalidToken = "invalid-confirmation-token";
        _tokenServiceMock
            .Setup(x => x.ValidateConfirmationTokenAsync(invalidToken))
            .ThrowsAsync(new UnauthorizedException("Invalid confirmation token"));

        var act = async () => await _handler.Handle(new ConfirmUserCommand(invalidToken), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ThrowsUnauthorizedException()
    {
        var userId = Guid.NewGuid();
        const string username = "nonexistent";
        const string confirmationToken = "valid-token-for-nonexistent-user";

        _tokenServiceMock
            .Setup(x => x.ValidateConfirmationTokenAsync(confirmationToken))
            .ReturnsAsync(MakeValidatedToken(userId, username));
        _authRepositoryMock.Setup(x => x.ConfirmUserAccountAsync(userId)).ReturnsAsync((UserAccount?)null);

        var act = async () => await _handler.Handle(new ConfirmUserCommand(confirmationToken), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedException>().WithMessage("*User account not found*");
    }
}
