using Features.Emails.Commands.SendRegistrationEmail;
using Features.Emails.Services;
using Moq;
using Shared.Application.Emails;

namespace Features.Emails.Tests.Commands;

public class SendRegistrationEmailHandlerTests
{
    [Fact]
    public async Task Handle_DelegatesToEmailDispatcher()
    {
        Mock<IEmailDispatcher> dispatcherMock = new();
        SendRegistrationEmailHandler handler = new(dispatcherMock.Object);
        SendRegistrationEmailCommand command = new("Aaron", "aaron@example.com", "token-123");

        await handler.Handle(command, CancellationToken.None);

        dispatcherMock.Verify(
            d => d.SendRegistrationEmailAsync("Aaron", "aaron@example.com", "token-123"),
            Times.Once
        );
    }
}