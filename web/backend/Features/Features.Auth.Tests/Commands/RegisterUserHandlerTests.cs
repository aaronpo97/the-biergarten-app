using Domain.Entities;
using Domain.Exceptions;
using Features.Auth.Commands.RegisterUser;
using Features.Auth.Dtos;
using Features.Auth.Repository;
using Features.Auth.Services;
using FluentAssertions;
using Infrastructure.PasswordHashing;
using MediatR;
using Moq;
using Shared.Application.Emails;

namespace Features.Auth.Tests.Commands;

public class RegisterUserHandlerTests
{
    private readonly Mock<IAuthRepository> _authRepoMock;
    private readonly RegisterUserHandler _handler;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly Mock<IPasswordInfrastructure> _passwordInfraMock;
    private readonly Mock<ITokenService> _tokenServiceMock;

    public RegisterUserHandlerTests()
    {
        _authRepoMock = new Mock<IAuthRepository>();
        _passwordInfraMock = new Mock<IPasswordInfrastructure>();
        _tokenServiceMock = new Mock<ITokenService>();
        _mediatorMock = new Mock<IMediator>();

        _handler = new RegisterUserHandler(
            _authRepoMock.Object,
            _passwordInfraMock.Object,
            _tokenServiceMock.Object,
            _mediatorMock.Object
        );
    }

    private static RegisterUserCommand ValidCommand(
        string username = "newuser",
        string email = "john.doe@example.com"
    )
    {
        return new RegisterUserCommand(
            username,
            "John",
            "Doe",
            email,
            new DateTime(1990, 1, 1),
            "SecurePassword123!"
        );
    }

    [Fact]
    public async Task Handle_WithValidData_CreatesUserAndReturnsPayload()
    {
        RegisterUserCommand command = ValidCommand();
        const string hashedPassword = "hashed_password_value";
        Guid expectedUserId = Guid.NewGuid();

        _authRepoMock
            .Setup(x => x.GetUserByUsernameAsync(command.Username))
            .ReturnsAsync((UserAccount?)null);
        _authRepoMock
            .Setup(x => x.GetUserByEmailAsync(command.Email))
            .ReturnsAsync((UserAccount?)null);
        _passwordInfraMock.Setup(x => x.Hash(command.Password)).Returns(hashedPassword);

        _authRepoMock
            .Setup(x =>
                x.RegisterUserAsync(
                    command.Username,
                    command.FirstName,
                    command.LastName,
                    command.Email,
                    command.DateOfBirth,
                    hashedPassword
                )
            )
            .ReturnsAsync(
                new UserAccount
                {
                    UserAccountId = expectedUserId,
                    Username = command.Username,
                    FirstName = command.FirstName,
                    LastName = command.LastName,
                    Email = command.Email,
                    DateOfBirth = command.DateOfBirth,
                    CreatedAt = DateTime.UtcNow,
                }
            );

        _tokenServiceMock
            .Setup(x => x.GenerateAccessToken(It.IsAny<UserAccount>()))
            .Returns("access-token");
        _tokenServiceMock
            .Setup(x => x.GenerateRefreshToken(It.IsAny<UserAccount>()))
            .Returns("refresh-token");
        _tokenServiceMock
            .Setup(x => x.GenerateConfirmationToken(It.IsAny<UserAccount>()))
            .Returns("confirmation-token");

        RegistrationPayload result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.UserAccountId.Should().Be(expectedUserId);
        result.Username.Should().Be(command.Username);
        result.AccessToken.Should().Be("access-token");
        result.RefreshToken.Should().Be("refresh-token");
        result.ConfirmationEmailSent.Should().BeTrue();

        _mediatorMock.Verify(
            x => x.Send(It.IsAny<SendRegistrationEmailCommand>(), It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_WithExistingUsername_ThrowsConflictException()
    {
        RegisterUserCommand command = ValidCommand("existinguser");
        UserAccount existingUser = new()
        {
            UserAccountId = Guid.NewGuid(),
            Username = "existinguser",
        };

        _authRepoMock
            .Setup(x => x.GetUserByUsernameAsync(command.Username))
            .ReturnsAsync(existingUser);
        _authRepoMock
            .Setup(x => x.GetUserByEmailAsync(command.Email))
            .ReturnsAsync((UserAccount?)null);

        Func<Task<RegistrationPayload>> act = async () =>
            await _handler.Handle(command, CancellationToken.None);

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
    public async Task Handle_WithExistingEmail_ThrowsConflictException()
    {
        RegisterUserCommand command = ValidCommand(email: "existing@example.com");
        UserAccount existingUser = new()
        {
            UserAccountId = Guid.NewGuid(),
            Email = "existing@example.com",
        };

        _authRepoMock
            .Setup(x => x.GetUserByUsernameAsync(command.Username))
            .ReturnsAsync((UserAccount?)null);
        _authRepoMock.Setup(x => x.GetUserByEmailAsync(command.Email)).ReturnsAsync(existingUser);

        Func<Task<RegistrationPayload>> act = async () =>
            await _handler.Handle(command, CancellationToken.None);

        await act.Should()
            .ThrowAsync<ConflictException>()
            .WithMessage("Username or email already exists");
    }

    [Fact]
    public async Task Handle_PasswordIsHashed_BeforeStoringInDatabase()
    {
        RegisterUserCommand command = ValidCommand();
        const string hashedPassword = "hashed_secure_password";

        _authRepoMock
            .Setup(x => x.GetUserByUsernameAsync(It.IsAny<string>()))
            .ReturnsAsync((UserAccount?)null);
        _authRepoMock
            .Setup(x => x.GetUserByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((UserAccount?)null);
        _passwordInfraMock.Setup(x => x.Hash(command.Password)).Returns(hashedPassword);

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

        await _handler.Handle(command, CancellationToken.None);

        _passwordInfraMock.Verify(x => x.Hash(command.Password), Times.Once);
        _authRepoMock.Verify(
            x =>
                x.RegisterUserAsync(
                    command.Username,
                    command.FirstName,
                    command.LastName,
                    command.Email,
                    command.DateOfBirth,
                    hashedPassword
                ),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_SwallowsEmailFailure_AndReportsEmailNotSent()
    {
        RegisterUserCommand command = ValidCommand();

        _authRepoMock
            .Setup(x => x.GetUserByUsernameAsync(It.IsAny<string>()))
            .ReturnsAsync((UserAccount?)null);
        _authRepoMock
            .Setup(x => x.GetUserByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((UserAccount?)null);
        _passwordInfraMock.Setup(x => x.Hash(It.IsAny<string>())).Returns("hashed");
        _authRepoMock
            .Setup(x =>
                x.RegisterUserAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<DateTime>(),
                    It.IsAny<string>()
                )
            )
            .ReturnsAsync(
                new UserAccount
                {
                    UserAccountId = Guid.NewGuid(),
                    Username = command.Username,
                    Email = command.Email,
                }
            );

        _tokenServiceMock
            .Setup(x => x.GenerateAccessToken(It.IsAny<UserAccount>()))
            .Returns("access-token");
        _tokenServiceMock
            .Setup(x => x.GenerateRefreshToken(It.IsAny<UserAccount>()))
            .Returns("refresh-token");
        _mediatorMock
            .Setup(x =>
                x.Send(It.IsAny<SendRegistrationEmailCommand>(), It.IsAny<CancellationToken>())
            )
            .ThrowsAsync(new Exception("smtp down"));

        RegistrationPayload result = await _handler.Handle(command, CancellationToken.None);

        result.ConfirmationEmailSent.Should().BeFalse();
        result.AccessToken.Should().Be("access-token");
    }
}
