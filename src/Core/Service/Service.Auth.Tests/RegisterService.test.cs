using Domain.Entities;
using Domain.Exceptions;
using FluentAssertions;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;
using Moq;
using Service.Emails;

namespace Service.Auth.Tests;

public class RegisterServiceTest
{
    private readonly Mock<IAuthRepository> _authRepoMock;
    private readonly Mock<IPasswordInfrastructure> _passwordInfraMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<IEmailService> _emailServiceMock; // todo handle email related test cases here
    private readonly RegisterService _registerService;

    public RegisterServiceTest()
    {
        _authRepoMock = new Mock<IAuthRepository>();
        _passwordInfraMock = new Mock<IPasswordInfrastructure>();
        _tokenServiceMock = new Mock<ITokenService>();
        _emailServiceMock = new Mock<IEmailService>();


        _registerService = new RegisterService(
            _authRepoMock.Object,
            _passwordInfraMock.Object,
            _tokenServiceMock.Object,
            _emailServiceMock.Object
        );
    }

    [Fact]
    public async Task RegisterAsync_WithValidData_CreatesUserAndReturnsAuthServiceReturn()
    {
        // Arrange
        var userAccount = new UserAccount
        {
            Username = "newuser",
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            DateOfBirth = new DateTime(1990, 1, 1),
        };

        const string password = "SecurePassword123!";
        const string hashedPassword = "hashed_password_value";
        var expectedUserId = Guid.NewGuid();

        // Mock: No existing user
        _authRepoMock
            .Setup(x => x.GetUserByUsernameAsync(userAccount.Username))
            .ReturnsAsync((UserAccount?)null);

        _authRepoMock
            .Setup(x => x.GetUserByEmailAsync(userAccount.Email))
            .ReturnsAsync((UserAccount?)null);

        // Mock: Password hashing
        _passwordInfraMock
            .Setup(x => x.Hash(password))
            .Returns(hashedPassword);

        // Mock: User registration
        _authRepoMock
            .Setup(x =>
                x.RegisterUserAsync(
                    userAccount.Username,
                    userAccount.FirstName,
                    userAccount.LastName,
                    userAccount.Email,
                    userAccount.DateOfBirth,
                    hashedPassword
                )
            )
            .ReturnsAsync(
                new UserAccount
                {
                    UserAccountId = expectedUserId,
                    Username = userAccount.Username,
                    FirstName = userAccount.FirstName,
                    LastName = userAccount.LastName,
                    Email = userAccount.Email,
                    DateOfBirth = userAccount.DateOfBirth,
                    CreatedAt = DateTime.UtcNow,
                }
            );

        // Mock: Token generation
        _tokenServiceMock
            .Setup(x => x.GenerateAccessToken(It.IsAny<UserAccount>()))
            .Returns("access-token");

        _tokenServiceMock
            .Setup(x => x.GenerateRefreshToken(It.IsAny<UserAccount>()))
            .Returns("refresh-token");


        // Act
        var result = await _registerService.RegisterAsync(
            userAccount,
            password
        );

        // Assert
        result.Should().NotBeNull();
        result.UserAccount.UserAccountId.Should().Be(expectedUserId);
        result.UserAccount.Username.Should().Be(userAccount.Username);
        result.UserAccount.Email.Should().Be(userAccount.Email);
        result.AccessToken.Should().Be("access-token");
        result.RefreshToken.Should().Be("refresh-token");

        // Verify all mocks were called as expected
        _authRepoMock.Verify(
            x => x.GetUserByUsernameAsync(userAccount.Username),
            Times.Once
        );
        _authRepoMock.Verify(
            x => x.GetUserByEmailAsync(userAccount.Email),
            Times.Once
        );
        _passwordInfraMock.Verify(x => x.Hash(password), Times.Once);
        _authRepoMock.Verify(
            x =>
                x.RegisterUserAsync(
                    userAccount.Username,
                    userAccount.FirstName,
                    userAccount.LastName,
                    userAccount.Email,
                    userAccount.DateOfBirth,
                    hashedPassword
                ),
            Times.Once
        );
        _emailServiceMock.Verify(x => x.SendRegistrationEmailAsync(It.IsAny<UserAccount>(), It.IsAny<string>()),
            Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_WithExistingUsername_ThrowsConflictException()
    {
        // Arrange
        var userAccount = new UserAccount
        {
            Username = "existinguser",
            FirstName = "Jane",
            LastName = "Smith",
            Email = "jane.smith@example.com",
            DateOfBirth = new DateTime(1995, 5, 15),
        };
        var password = "Password123!";

        var existingUser = new UserAccount
        {
            UserAccountId = Guid.NewGuid(),
            Username = "existinguser",
            FirstName = "Existing",
            LastName = "User",
            Email = "existing@example.com",
            DateOfBirth = new DateTime(1990, 1, 1),
        };

        _authRepoMock
            .Setup(x => x.GetUserByUsernameAsync(userAccount.Username))
            .ReturnsAsync(existingUser);

        _authRepoMock
            .Setup(x => x.GetUserByEmailAsync(userAccount.Email))
            .ReturnsAsync((UserAccount?)null);

        // Act
        var act = async () =>
            await _registerService.RegisterAsync(userAccount, password);

        // Assert
        await act.Should()
            .ThrowAsync<ConflictException>()
            .WithMessage("Username or email already exists");

        // Verify that registration was never called
        _authRepoMock.Verify(
            x =>
                x.RegisterUserAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<DateTime>(),
                    It.IsAny<string>()
                ),
            Times.Never
        );
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ThrowsConflictException()
    {
        // Arrange
        var userAccount = new UserAccount
        {
            Username = "newuser",
            FirstName = "Jane",
            LastName = "Smith",
            Email = "existing@example.com",
            DateOfBirth = new DateTime(1995, 5, 15),
        };
        var password = "Password123!";

        var existingUser = new UserAccount
        {
            UserAccountId = Guid.NewGuid(),
            Username = "otheruser",
            FirstName = "Existing",
            LastName = "User",
            Email = "existing@example.com",
            DateOfBirth = new DateTime(1990, 1, 1),
        };

        _authRepoMock
            .Setup(x => x.GetUserByUsernameAsync(userAccount.Username))
            .ReturnsAsync((UserAccount?)null);

        _authRepoMock
            .Setup(x => x.GetUserByEmailAsync(userAccount.Email))
            .ReturnsAsync(existingUser);

        // Act
        var act = async () =>
            await _registerService.RegisterAsync(userAccount, password);

        // Assert
        await act.Should()
            .ThrowAsync<ConflictException>()
            .WithMessage("Username or email already exists");

        _authRepoMock.Verify(
            x =>
                x.RegisterUserAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<DateTime>(),
                    It.IsAny<string>()
                ),
            Times.Never
        );
    }

    [Fact]
    public async Task RegisterAsync_PasswordIsHashed_BeforeStoringInDatabase()
    {
        // Arrange
        var userAccount = new UserAccount
        {
            Username = "secureuser",
            FirstName = "Secure",
            LastName = "User",
            Email = "secure@example.com",
            DateOfBirth = new DateTime(1990, 1, 1),
        };
        var plainPassword = "PlainPassword123!";
        var hashedPassword = "hashed_secure_password";

        _authRepoMock
            .Setup(x => x.GetUserByUsernameAsync(It.IsAny<string>()))
            .ReturnsAsync((UserAccount?)null);

        _authRepoMock
            .Setup(x => x.GetUserByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((UserAccount?)null);

        _passwordInfraMock
            .Setup(x => x.Hash(plainPassword))
            .Returns(hashedPassword);

        _authRepoMock
            .Setup(x =>
                x.RegisterUserAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<DateTime>(),
                    hashedPassword
                )
            )
            .ReturnsAsync(new UserAccount { UserAccountId = Guid.NewGuid() });

        _tokenServiceMock
            .Setup(x => x.GenerateAccessToken(It.IsAny<UserAccount>()))
            .Returns("access-token");

        _tokenServiceMock
            .Setup(x => x.GenerateRefreshToken(It.IsAny<UserAccount>()))
            .Returns("refresh-token");

        // Act
        await _registerService.RegisterAsync(userAccount, plainPassword);

        // Assert
        _passwordInfraMock.Verify(x => x.Hash(plainPassword), Times.Once);
        _authRepoMock.Verify(
            x =>
                x.RegisterUserAsync(
                    userAccount.Username,
                    userAccount.FirstName,
                    userAccount.LastName,
                    userAccount.Email,
                    userAccount.DateOfBirth,
                    hashedPassword
                ), // Verify hashed password is used
            Times.Once
        );
    }
}