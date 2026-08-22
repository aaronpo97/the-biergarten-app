using Domain.Exceptions;
using Features.Auth.Commands.Login;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using Features.Auth.Services;
using Features.Auth.Tests.TestSupport;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace Features.Auth.Tests.Queries;

public class LoginHandlerTests
{
    private readonly LoginHandler _handler;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;

    public LoginHandlerTests()
    {
        _userManagerMock = UserManagerMockFactory.Create();
        _tokenServiceMock = new Mock<ITokenService>();
        _handler = new LoginHandler(_userManagerMock.Object, _tokenServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidData_ReturnsPayloadWithMatchingUsername()
    {
        const string username = "CogitoErgoSum";
        Guid userAccountId = Guid.NewGuid();

        ApplicationUser user = new()
        {
            Id = userAccountId,
            UserName = username,
            FirstName = "René",
            LastName = "Descartes",
            Email = "r.descartes@example.com",
            DateOfBirth = new DateTime(1596, 03, 31),
        };

        _userManagerMock.Setup(x => x.FindByNameAsync(username)).ReturnsAsync(user);
        _userManagerMock
            .Setup(x => x.CheckPasswordAsync(user, It.IsAny<string>()))
            .ReturnsAsync(true);
        _tokenServiceMock
            .Setup(x => x.GenerateAccessToken(It.IsAny<Guid>(), It.IsAny<string>()))
            .Returns("access-token");
        _tokenServiceMock
            .Setup(x => x.GenerateRefreshToken(It.IsAny<Guid>(), It.IsAny<string>()))
            .Returns("refresh-token");

        LoginPayload result = await _handler.Handle(
            new LoginCommand(username, "any-password"),
            CancellationToken.None
        );

        result.Should().NotBeNull();
        result.UserAccountId.Should().Be(userAccountId);
        result.Username.Should().Be(username);
        result.AccessToken.Should().Be("access-token");
        result.RefreshToken.Should().Be("refresh-token");
    }

    [Fact]
    public async Task Handle_WithUnregisteredUsername_ThrowsUnauthorizedException()
    {
        const string username = "de_beauvoir";
        _userManagerMock
            .Setup(x => x.FindByNameAsync(username))
            .ReturnsAsync((ApplicationUser?)null);

        Func<Task<LoginPayload>> act = async () =>
            await _handler.Handle(new LoginCommand(username, "password"), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedException>();
        _userManagerMock.Verify(
            x => x.CheckPasswordAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()),
            Times.Never
        );
    }

    [Fact]
    public async Task Handle_WithNoActiveCredential_ThrowsUnauthorizedException()
    {
        const string username = "BRussell";
        ApplicationUser user = new() { Id = Guid.NewGuid(), UserName = username };

        _userManagerMock.Setup(x => x.FindByNameAsync(username)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.CheckPasswordAsync(user, It.IsAny<string>())).ReturnsAsync(false);

        Func<Task<LoginPayload>> act = async () =>
            await _handler.Handle(new LoginCommand(username, "password"), CancellationToken.None);

        await act.Should()
            .ThrowAsync<UnauthorizedException>()
            .WithMessage("Invalid username or password.");
    }

    [Fact]
    public async Task Handle_WithIncorrectPassword_ThrowsUnauthorizedException()
    {
        const string username = "RCarnap";
        ApplicationUser user = new() { Id = Guid.NewGuid(), UserName = username };

        _userManagerMock.Setup(x => x.FindByNameAsync(username)).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.CheckPasswordAsync(user, It.IsAny<string>())).ReturnsAsync(false);

        Func<Task<LoginPayload>> act = async () =>
            await _handler.Handle(
                new LoginCommand(username, "wrong-password"),
                CancellationToken.None
            );

        await act.Should()
            .ThrowAsync<UnauthorizedException>()
            .WithMessage("Invalid username or password.");
    }
}
