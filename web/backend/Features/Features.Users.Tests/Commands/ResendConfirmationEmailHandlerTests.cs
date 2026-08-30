using Features.Auth.Commands.ResendConfirmationEmail;
using Features.Auth.Identity;
using Features.Auth.Services;
using Features.Auth.Tests.TestSupport;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Moq;
using Shared.Application.Emails;

namespace Features.Auth.Tests.Commands;

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
                x.Send(
                    It.Is<SendResendConfirmationEmailCommand>(c =>
                        c.FirstName == "Aaron"
                        && c.Email == "aaron@example.com"
                        && c.ConfirmationToken == "fresh-token"
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
                x.Send(
                    It.IsAny<SendResendConfirmationEmailCommand>(),
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
                x.Send(
                    It.IsAny<SendResendConfirmationEmailCommand>(),
                    It.IsAny<CancellationToken>()
                ),
            Times.Never
        );
    }
}
