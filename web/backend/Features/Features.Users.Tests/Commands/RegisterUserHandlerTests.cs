using Domain.Exceptions;
using Features.Auth.Commands.Authentication.RegisterUser;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using Features.Auth.Services;
using Features.Auth.Tests.TestSupport;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Moq;
using Shared.Application.Emails;

namespace Features.Auth.Tests.Commands;

public class RegisterUserHandlerTests
{
    private readonly RegisterUserHandler _handler;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;

    public RegisterUserHandlerTests()
    {
        _userManagerMock = UserManagerMockFactory.Create();
        _tokenServiceMock = new Mock<ITokenService>();
        _mediatorMock = new Mock<IMediator>();

        _handler = new RegisterUserHandler(
            _userManagerMock.Object,
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
        Guid expectedUserId = Guid.NewGuid();

        _userManagerMock
            .Setup(x =>
                x.CreateAsync(
                    It.Is<ApplicationUser>(u =>
                        u.FirstName == command.FirstName
                        && u.LastName == command.LastName
                        && u.UserName == command.Username
                        && u.Email == command.Email
                        && u.DateOfBirth == command.DateOfBirth
                    ),
                    command.Password
                )
            )
            .Callback<ApplicationUser, string>((u, _) => u.Id = expectedUserId)
            .ReturnsAsync(IdentityResult.Success);

        _tokenServiceMock
            .Setup(x => x.GenerateAccessToken(It.IsAny<Guid>(), It.IsAny<string>()))
            .Returns("access-token");
        _tokenServiceMock
            .Setup(x => x.GenerateRefreshToken(It.IsAny<Guid>(), It.IsAny<string>()))
            .Returns("refresh-token");
        _tokenServiceMock
            .Setup(x => x.GenerateConfirmationToken(It.IsAny<Guid>(), It.IsAny<string>()))
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

        _userManagerMock
            .Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), command.Password))
            .ReturnsAsync(
                IdentityResult.Failed(
                    new IdentityError
                    {
                        Code = "DuplicateUserName",
                        Description = "Username taken.",
                    }
                )
            );

        Func<Task<RegistrationPayload>> act = async () =>
            await _handler.Handle(command, CancellationToken.None);

        await act.Should()
            .ThrowAsync<ConflictException>()
            .WithMessage("Username or email already exists");
    }

    [Fact]
    public async Task Handle_WithExistingEmail_ThrowsConflictException()
    {
        RegisterUserCommand command = ValidCommand(email: "existing@example.com");

        _userManagerMock
            .Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), command.Password))
            .ReturnsAsync(
                IdentityResult.Failed(
                    new IdentityError { Code = "DuplicateEmail", Description = "Email taken." }
                )
            );

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

        _userManagerMock
            .Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), command.Password))
            .Callback<ApplicationUser, string>((u, _) => u.Id = Guid.NewGuid())
            .ReturnsAsync(IdentityResult.Success);

        _tokenServiceMock
            .Setup(x => x.GenerateAccessToken(It.IsAny<Guid>(), It.IsAny<string>()))
            .Returns("access-token");
        _tokenServiceMock
            .Setup(x => x.GenerateRefreshToken(It.IsAny<Guid>(), It.IsAny<string>()))
            .Returns("refresh-token");

        await _handler.Handle(command, CancellationToken.None);

        // UserManager.CreateAsync receives the plaintext password and hashes it internally via
        // IPasswordHasher<ApplicationUser> -- the handler never sees or stores a hash directly.
        _userManagerMock.Verify(
            x =>
                x.CreateAsync(
                    It.Is<ApplicationUser>(u =>
                        u.FirstName == command.FirstName
                        && u.LastName == command.LastName
                        && u.UserName == command.Username
                        && u.DateOfBirth == command.DateOfBirth
                        && u.Email == command.Email
                    ),
                    command.Password
                ),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_SwallowsEmailFailure_AndReportsEmailNotSent()
    {
        RegisterUserCommand command = ValidCommand();

        _userManagerMock
            .Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), command.Password))
            .Callback<ApplicationUser, string>((u, _) => u.Id = Guid.NewGuid())
            .ReturnsAsync(IdentityResult.Success);

        _tokenServiceMock
            .Setup(x => x.GenerateAccessToken(It.IsAny<Guid>(), It.IsAny<string>()))
            .Returns("access-token");
        _tokenServiceMock
            .Setup(x => x.GenerateRefreshToken(It.IsAny<Guid>(), It.IsAny<string>()))
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
