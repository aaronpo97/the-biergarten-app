using Features.Emails.Commands.SendResendConfirmationEmail;
using Features.Emails.Services;
using Moq;
using Shared.Application.Emails;

namespace Features.Emails.Tests.Commands;

public class SendResendConfirmationEmailHandlerTests
{
    [Fact]
    public async Task Handle_DelegatesToEmailDispatcher()
    {
        Mock<IEmailDispatcher> dispatcherMock = new();
        SendResendConfirmationEmailHandler handler = new(dispatcherMock.Object);
        SendResendConfirmationEmailCommand command = new("Aaron", "aaron@example.com", "token-456");

        await handler.Handle(command, CancellationToken.None);

        dispatcherMock.Verify(
            d => d.SendResendConfirmationEmailAsync("Aaron", "aaron@example.com", "token-456"),
            Times.Once
        );
    }
}