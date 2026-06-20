using Domain.Entities;
using Domain.Exceptions;
using FluentAssertions;
using Features.Auth.Queries.Login;
using Features.Auth.Repository;
using Features.Auth.Services;
using Infrastructure.PasswordHashing;
using Moq;

namespace Features.Auth.Tests.Queries;

public class LoginHandlerTests
{
    private readonly Mock<IAuthRepository> _authRepoMock;
    private readonly Mock<IPasswordInfrastructure> _passwordInfraMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly LoginHandler _handler;

    public LoginHandlerTests()
    {
        _authRepoMock = new Mock<IAuthRepository>();
        _passwordInfraMock = new Mock<IPasswordInfrastructure>();
        _tokenServiceMock = new Mock<ITokenService>();
        _handler = new LoginHandler(_authRepoMock.Object, _passwordInfraMock.Object, _tokenServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidData_ReturnsPayloadWithMatchingUsername()
    {
        const string username = "CogitoErgoSum";
        var userAccountId = Guid.NewGuid();

        var userAccount = new UserAccount
        {
            UserAccountId = userAccountId,
            Username = username,
            FirstName = "René",
            LastName = "Descartes",
            Email = "r.descartes@example.com",
            DateOfBirth = new DateTime(1596, 03, 31),
        };

        var userCredential = new UserCredential
        {
            UserCredentialId = Guid.NewGuid(),
            UserAccountId = userAccountId,
            Hash = "some-hash",
            Expiry = DateTime.MaxValue,
        };

        _authRepoMock.Setup(x => x.GetUserByUsernameAsync(username)).ReturnsAsync(userAccount);
        _authRepoMock.Setup(x => x.GetActiveCredentialByUserAccountIdAsync(userAccountId)).ReturnsAsync(userCredential);
        _passwordInfraMock.Setup(x => x.Verify(It.IsAny<string>(), It.IsAny<string>())).Returns(true);
        _tokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<UserAccount>())).Returns("access-token");
        _tokenServiceMock.Setup(x => x.GenerateRefreshToken(It.IsAny<UserAccount>())).Returns("refresh-token");

        var result = await _handler.Handle(new LoginQuery(username, "any-password"), CancellationToken.None);

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
        _authRepoMock.Setup(x => x.GetUserByUsernameAsync(username)).ReturnsAsync((UserAccount?)null);

        var act = async () => await _handler.Handle(new LoginQuery(username, "password"), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedException>();
        _authRepoMock.Verify(x => x.GetActiveCredentialByUserAccountIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithNoActiveCredential_ThrowsUnauthorizedException()
    {
        const string username = "BRussell";
        var userAccountId = Guid.NewGuid();
        var userAccount = new UserAccount { UserAccountId = userAccountId, Username = username };

        _authRepoMock.Setup(x => x.GetUserByUsernameAsync(username)).ReturnsAsync(userAccount);
        _authRepoMock.Setup(x => x.GetActiveCredentialByUserAccountIdAsync(userAccountId)).ReturnsAsync((UserCredential?)null);

        var act = async () => await _handler.Handle(new LoginQuery(username, "password"), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedException>().WithMessage("Invalid username or password.");
        _passwordInfraMock.Verify(x => x.Verify(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithIncorrectPassword_ThrowsUnauthorizedException()
    {
        const string username = "RCarnap";
        var userAccountId = Guid.NewGuid();
        var userAccount = new UserAccount { UserAccountId = userAccountId, Username = username };
        var userCredential = new UserCredential { UserCredentialId = Guid.NewGuid(), UserAccountId = userAccountId, Hash = "hashed-password" };

        _authRepoMock.Setup(x => x.GetUserByUsernameAsync(username)).ReturnsAsync(userAccount);
        _authRepoMock.Setup(x => x.GetActiveCredentialByUserAccountIdAsync(userAccountId)).ReturnsAsync(userCredential);
        _passwordInfraMock.Setup(x => x.Verify(It.IsAny<string>(), It.IsAny<string>())).Returns(false);

        var act = async () => await _handler.Handle(new LoginQuery(username, "wrong-password"), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedException>().WithMessage("Invalid username or password.");
    }
}
