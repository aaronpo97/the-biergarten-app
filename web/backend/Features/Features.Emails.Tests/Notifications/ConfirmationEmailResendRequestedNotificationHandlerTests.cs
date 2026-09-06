using Features.Emails.Notifications;
using Features.Emails.Services;
using Features.Users.Notifications;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace Features.Emails.Tests.Notifications;

public class ConfirmationEmailResendRequestedNotificationHandlerTests
{
    [Fact]
    public async Task Handle_DelegatesToEmailDispatcher()
    {
        Mock<IEmailDispatcher> dispatcherMock = new();
        ConfirmationEmailResendRequestedNotificationHandler handler = new(
            dispatcherMock.Object,
            Mock.Of<ILogger<ConfirmationEmailResendRequestedNotificationHandler>>()
        );
        ConfirmationEmailResendRequestedNotification notification = new(
            Guid.NewGuid(),
            "Aaron",
            "aaron@example.com",
            "token-456"
        );

        await handler.Handle(notification, CancellationToken.None);

        dispatcherMock.Verify(
            d => d.SendResendConfirmationEmailAsync("Aaron", "aaron@example.com", "token-456"),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_SwallowsDispatcherFailure()
    {
        Mock<IEmailDispatcher> dispatcherMock = new();
        dispatcherMock
            .Setup(d =>
                d.SendResendConfirmationEmailAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>()
                )
            )
            .ThrowsAsync(new Exception("smtp down"));
        ConfirmationEmailResendRequestedNotificationHandler handler = new(
            dispatcherMock.Object,
            Mock.Of<ILogger<ConfirmationEmailResendRequestedNotificationHandler>>()
        );
        ConfirmationEmailResendRequestedNotification notification = new(
            Guid.NewGuid(),
            "Aaron",
            "aaron@example.com",
            "token-456"
        );

        Func<Task> act = async () => await handler.Handle(notification, CancellationToken.None);

        await act.Should().NotThrowAsync();
    }
}
