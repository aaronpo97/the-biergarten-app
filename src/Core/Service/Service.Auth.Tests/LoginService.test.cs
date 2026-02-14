using Domain.Entities;
using Domain.Exceptions;
using FluentAssertions;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;
using Moq;

namespace Service.Auth.Tests;

public class LoginServiceTest
{
    private readonly Mock<IAuthRepository> _authRepoMock;
    private readonly Mock<IPasswordInfrastructure> _passwordInfraMock;
    private readonly LoginService _loginService;

    public LoginServiceTest()
    {
        _authRepoMock = new Mock<IAuthRepository>();
        _passwordInfraMock = new Mock<IPasswordInfrastructure>();
        _loginService = new LoginService(
            _authRepoMock.Object,
            _passwordInfraMock.Object
        );
    }

    // Happy path: login returns the user account with the same username -- successful login
    [Fact]
    public async Task LoginAsync_WithValidData_ReturnsUserAccountWithMatchingUsername()
    {
        // Arrange
        const string username = "CogitoErgoSum";
        var userAccountId = Guid.NewGuid();

        UserAccount userAccount = new()
        {
            UserAccountId = userAccountId,
            Username = username,
            FirstName = "René",
            LastName = "Descartes",
            Email = "r.descartes@example.com",
            DateOfBirth = new DateTime(1596, 03, 31),
        };

        UserCredential userCredential = new()
        {
            UserCredentialId = Guid.NewGuid(),
            UserAccountId = userAccountId,
            Hash = "some-hash",
            Expiry = DateTime.MaxValue,
        };

        _authRepoMock
            .Setup(x => x.GetUserByUsernameAsync(username))
            .ReturnsAsync(userAccount);

        _authRepoMock
            .Setup(x =>
                x.GetActiveCredentialByUserAccountIdAsync(userAccountId)
            )
            .ReturnsAsync(userCredential);

        _passwordInfraMock
            .Setup(x => x.Verify(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(true);

        // Act
        var result = await _loginService.LoginAsync(username, It.IsAny<string>());

        // Assert
        result.Should().NotBeNull();
        result.UserAccountId.Should().Be(userAccountId);
        result.Username.Should().Be(username);

        _authRepoMock.Verify(
            x => x.GetActiveCredentialByUserAccountIdAsync(userAccountId),
            Times.Once
        );

        _authRepoMock.Verify(
            x => x.GetUserByUsernameAsync(username),
            Times.Once
        );

        _passwordInfraMock.Verify(
            x => x.Verify(It.IsAny<string>(), It.IsAny<string>()),
            Times.Once
        );
    }

    [Fact]
    public async Task LoginAsync_WithUnregisteredUsername_ThrowsUnauthorizedException()
    {
        // Arrange
        const string username = "de_beauvoir";

        _authRepoMock
            .Setup(x => x.GetUserByUsernameAsync(username))
            .ReturnsAsync((UserAccount?)null);

        // Act
        var act = async () =>
            await _loginService.LoginAsync(username, It.IsAny<string>());

        // Assert
        await act.Should().ThrowAsync<UnauthorizedException>();

        _authRepoMock.Verify(
            x => x.GetUserByUsernameAsync(username),
            Times.Once
        );

        _authRepoMock.Verify(
            x => x.GetActiveCredentialByUserAccountIdAsync(It.IsAny<Guid>()),
            Times.Never
        );

        _passwordInfraMock.Verify(
            x => x.Verify(It.IsAny<string>(), It.IsAny<string>()),
            Times.Never
        );
    }

    [Fact]
    public async Task LoginAsync_WithNoActiveCredential_ThrowsUnauthorizedException()
    {
        // Arrange
        const string username = "BRussell";
        var userAccountId = Guid.NewGuid();

        UserAccount userAccount = new()
        {
            UserAccountId = userAccountId,
            Username = username,
            FirstName = "Bertrand",
            LastName = "Russell",
            Email = "b.russell@example.co.uk",
            DateOfBirth = new DateTime(1872, 05, 18),
        };

        _authRepoMock
            .Setup(x => x.GetUserByUsernameAsync(username))
            .ReturnsAsync(userAccount);

        _authRepoMock
            .Setup(x =>
                x.GetActiveCredentialByUserAccountIdAsync(userAccountId)
            )
            .ReturnsAsync((UserCredential?)null);

        // Act
        var act = async () =>
            await _loginService.LoginAsync(username, It.IsAny<string>());

        // Assert
        await act.Should()
            .ThrowAsync<UnauthorizedException>()
            .WithMessage("Invalid username or password.");

        _authRepoMock.Verify(
            x => x.GetUserByUsernameAsync(username),
            Times.Once
        );

        _authRepoMock.Verify(
            x => x.GetActiveCredentialByUserAccountIdAsync(userAccountId),
            Times.Once
        );

        _passwordInfraMock.Verify(
            x => x.Verify(It.IsAny<string>(), It.IsAny<string>()),
            Times.Never
        );
    }

    [Fact]
    public async Task LoginAsync_WithIncorrectPassword_ThrowsUnauthorizedException()
    {
        // Arrange
        const string username = "RCarnap";
        var userAccountId = Guid.NewGuid();

        UserAccount userAccount = new()
        {
            UserAccountId = userAccountId,
            Username = username,
            FirstName = "Rudolf",
            LastName = "Carnap",
            Email = "r.carnap@example.de",
            DateOfBirth = new DateTime(1891, 05, 18),
        };

        UserCredential userCredential = new()
        {
            UserCredentialId = Guid.NewGuid(),
            UserAccountId = userAccountId,
            Hash = "hashed-password",
            Expiry = DateTime.MaxValue,
        };

        _authRepoMock
            .Setup(x => x.GetUserByUsernameAsync(username))
            .ReturnsAsync(userAccount);

        _authRepoMock
            .Setup(x =>
                x.GetActiveCredentialByUserAccountIdAsync(userAccountId)
            )
            .ReturnsAsync(userCredential);

        _passwordInfraMock
            .Setup(x => x.Verify(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(false);

        // Act
        var act = async () =>
            await _loginService.LoginAsync(username, It.IsAny<string>());

        // Assert
        await act.Should()
            .ThrowAsync<UnauthorizedException>()
            .WithMessage("Invalid username or password.");

        _authRepoMock.Verify(
            x => x.GetUserByUsernameAsync(username),
            Times.Once
        );

        _authRepoMock.Verify(
            x => x.GetActiveCredentialByUserAccountIdAsync(userAccountId),
            Times.Once
        );

        _passwordInfraMock.Verify(
            x => x.Verify(It.IsAny<string>(), It.IsAny<string>()),
            Times.Once
        );
    }
}
