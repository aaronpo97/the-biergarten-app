using Domain.Entities;
using Features.Auth.Commands.ResendConfirmationEmail;
using Features.Auth.Repository;
using Features.Auth.Services;
using MediatR;
using Moq;
using Shared.Application.Emails;

namespace Features.Auth.Tests.Commands;

public class ResendConfirmationEmailHandlerTests
{
    private readonly Mock<IAuthRepository> _authRepositoryMock = new();
    private readonly ResendConfirmationEmailHandler _handler;
    private readonly Mock<IMediator> _mediatorMock = new();
    private readonly Mock<ITokenService> _tokenServiceMock = new();

    public ResendConfirmationEmailHandlerTests()
    {
        _handler = new ResendConfirmationEmailHandler(_authRepositoryMock.Object, _tokenServiceMock.Object,
            _mediatorMock.Object);
    }

    [Fact]
    public async Task Handle_SendsFreshConfirmationEmail_WhenUserExistsAndUnverified()
    {
        Guid userId = Guid.NewGuid();
        UserAccount user = new() { UserAccountId = userId, FirstName = "Aaron", Email = "aaron@example.com" };

        _authRepositoryMock.Setup(x => x.GetUserByIdAsync(userId)).ReturnsAsync(user);
        _authRepositoryMock.Setup(x => x.IsUserVerifiedAsync(userId)).ReturnsAsync(false);
        _tokenServiceMock.Setup(x => x.GenerateConfirmationToken(user)).Returns("fresh-token");

        await _handler.Handle(new ResendConfirmationEmailCommand(userId), CancellationToken.None);

        _mediatorMock.Verify(
            x => x.Send(It.Is<SendResendConfirmationEmailCommand>(c =>
                c.FirstName == "Aaron" && c.Email == "aaron@example.com" && c.ConfirmationToken == "fresh-token"
            ), It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_DoesNothing_WhenUserDoesNotExist()
    {
        Guid userId = Guid.NewGuid();
        _authRepositoryMock.Setup(x => x.GetUserByIdAsync(userId)).ReturnsAsync((UserAccount?)null);

        await _handler.Handle(new ResendConfirmationEmailCommand(userId), CancellationToken.None);

        _mediatorMock.Verify(
            x => x.Send(It.IsAny<SendResendConfirmationEmailCommand>(), It.IsAny<CancellationToken>()),
            Times.Never
        );
    }

    [Fact]
    public async Task Handle_DoesNothing_WhenUserAlreadyVerified()
    {
        Guid userId = Guid.NewGuid();
        UserAccount user = new() { UserAccountId = userId };

        _authRepositoryMock.Setup(x => x.GetUserByIdAsync(userId)).ReturnsAsync(user);
        _authRepositoryMock.Setup(x => x.IsUserVerifiedAsync(userId)).ReturnsAsync(true);

        await _handler.Handle(new ResendConfirmationEmailCommand(userId), CancellationToken.None);

        _mediatorMock.Verify(
            x => x.Send(It.IsAny<SendResendConfirmationEmailCommand>(), It.IsAny<CancellationToken>()),
            Times.Never
        );
    }
}