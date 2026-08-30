using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Domain.Exceptions;
using Features.Auth.Commands.ConfirmUser;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using Features.Auth.Services;
using Features.Auth.Tests.TestSupport;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace Features.Auth.Tests.Commands;

public class ConfirmUserHandlerTests
{
    private readonly Mock<IUserEmailStore<ApplicationUser>> _emailStoreMock;
    private readonly ConfirmUserHandler _handler;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;

    public ConfirmUserHandlerTests()
    {
        _userManagerMock = UserManagerMockFactory.Create();
        _emailStoreMock = new Mock<IUserEmailStore<ApplicationUser>>();
        _tokenServiceMock = new Mock<ITokenService>();
        _handler = new ConfirmUserHandler(
            _userManagerMock.Object,
            _emailStoreMock.Object,
            _tokenServiceMock.Object
        );
    }

    private static ValidatedToken MakeValidatedToken(Guid userId, string username)
    {
        List<Claim> claims = new()
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        ClaimsPrincipal principal = new(new ClaimsIdentity(claims));
        return new ValidatedToken(userId, username, principal);
    }

    [Fact]
    public async Task Handle_WithValidConfirmationToken_ConfirmsUser()
    {
        Guid userId = Guid.NewGuid();
        const string username = "testuser";
        const string confirmationToken = "valid-confirmation-token";

        ValidatedToken validatedToken = MakeValidatedToken(userId, username);
        ApplicationUser user = new() { Id = userId, UserName = username };

        _tokenServiceMock
            .Setup(x => x.ValidateConfirmationTokenAsync(confirmationToken))
            .ReturnsAsync(validatedToken);
        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString())).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.UpdateAsync(user)).ReturnsAsync(IdentityResult.Success);

        ConfirmationPayload result = await _handler.Handle(
            new ConfirmUserCommand(confirmationToken),
            CancellationToken.None
        );

        result.Should().NotBeNull();
        result.UserAccountId.Should().Be(userId);
        result.ConfirmedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));

        _emailStoreMock.Verify(
            x => x.SetEmailConfirmedAsync(user, true, It.IsAny<CancellationToken>()),
            Times.Once
        );
        _userManagerMock.Verify(x => x.UpdateAsync(user), Times.Once);
    }

    [Fact]
    public async Task Handle_WithInvalidConfirmationToken_ThrowsUnauthorizedException()
    {
        const string invalidToken = "invalid-confirmation-token";
        _tokenServiceMock
            .Setup(x => x.ValidateConfirmationTokenAsync(invalidToken))
            .ThrowsAsync(new UnauthorizedException("Invalid confirmation token"));

        Func<Task<ConfirmationPayload>> act = async () =>
            await _handler.Handle(new ConfirmUserCommand(invalidToken), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ThrowsUnauthorizedException()
    {
        Guid userId = Guid.NewGuid();
        const string username = "nonexistent";
        const string confirmationToken = "valid-token-for-nonexistent-user";

        _tokenServiceMock
            .Setup(x => x.ValidateConfirmationTokenAsync(confirmationToken))
            .ReturnsAsync(MakeValidatedToken(userId, username));
        _userManagerMock
            .Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((ApplicationUser?)null);

        Func<Task<ConfirmationPayload>> act = async () =>
            await _handler.Handle(
                new ConfirmUserCommand(confirmationToken),
                CancellationToken.None
            );

        await act.Should()
            .ThrowAsync<UnauthorizedException>()
            .WithMessage("*User account not found*");
    }
}
