using Features.Users.Commands.Authentication.ResendConfirmationEmail;
using Features.Users.Identity;
using Features.Users.Notifications;
using Features.Users.Services;
using Features.Users.Tests.TestSupport;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace Features.Users.Tests.Commands;

public class ResendConfirmationEmailHandlerTests
{
    private readonly ResendConfirmationEmailHandler _handler;
    private readonly Mock<IMediator> _mediatorMock = new();
    private readonly Mock<ITokenService> _tokenServiceMock = new();
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock =
        UserManagerMockFactory.Create();

    public ResendConfirmationEmailHandlerTests()
    {
        _handler = new ResendConfirmationEmailHandler(
            _userManagerMock.Object,
            _tokenServiceMock.Object,
            _mediatorMock.Object
        );
    }

    [Fact]
    public async Task Handle_SendsFreshConfirmationEmail_WhenUserExistsAndUnverified()
    {
        Guid userId = Guid.NewGuid();
        ApplicationUser user = new()
        {
            Id = userId,
            FirstName = "Aaron",
            Email = "aaron@example.com",
        };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString())).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.IsEmailConfirmedAsync(user)).ReturnsAsync(false);
        _tokenServiceMock
            .Setup(x => x.GenerateConfirmationToken(user.Id, user.UserName))
            .Returns("fresh-token");

        await _handler.Handle(new ResendConfirmationEmailCommand(userId), CancellationToken.None);

        _mediatorMock.Verify(
            x =>
                x.Publish(
                    It.Is<ConfirmationEmailResendRequestedNotification>(n =>
                        n.UserId == userId
                        && n.FirstName == "Aaron"
                        && n.Email == "aaron@example.com"
                        && n.ConfirmationToken == "fresh-token"
                    ),
                    It.IsAny<CancellationToken>()
                ),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_DoesNothing_WhenUserDoesNotExist()
    {
        Guid userId = Guid.NewGuid();
        _userManagerMock
            .Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((ApplicationUser?)null);

        await _handler.Handle(new ResendConfirmationEmailCommand(userId), CancellationToken.None);

        _mediatorMock.Verify(
            x =>
                x.Publish(
                    It.IsAny<ConfirmationEmailResendRequestedNotification>(),
                    It.IsAny<CancellationToken>()
                ),
            Times.Never
        );
    }

    [Fact]
    public async Task Handle_DoesNothing_WhenUserAlreadyVerified()
    {
        Guid userId = Guid.NewGuid();
        ApplicationUser user = new() { Id = userId };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString())).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.IsEmailConfirmedAsync(user)).ReturnsAsync(true);

        await _handler.Handle(new ResendConfirmationEmailCommand(userId), CancellationToken.None);

        _mediatorMock.Verify(
            x =>
                x.Publish(
                    It.IsAny<ConfirmationEmailResendRequestedNotification>(),
                    It.IsAny<CancellationToken>()
                ),
            Times.Never
        );
    }
}
