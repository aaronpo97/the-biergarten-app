using Features.Auth.Notifications;
using Features.Emails.Notifications;
using Features.Emails.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace Features.Emails.Tests.Notifications;

public class UserRegisteredNotificationHandlerTests
{
    [Fact]
    public async Task Handle_DelegatesToEmailDispatcher()
    {
        Mock<IEmailDispatcher> dispatcherMock = new();
        UserRegisteredNotificationHandler handler = new(
            dispatcherMock.Object,
            Mock.Of<ILogger<UserRegisteredNotificationHandler>>()
        );
        UserRegisteredNotification notification = new(
            Guid.NewGuid(),
            "Aaron",
            "aaron@example.com",
            "token-123"
        );

        await handler.Handle(notification, CancellationToken.None);

        dispatcherMock.Verify(
            d => d.SendRegistrationEmailAsync("Aaron", "aaron@example.com", "token-123"),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_SwallowsDispatcherFailure()
    {
        Mock<IEmailDispatcher> dispatcherMock = new();
        dispatcherMock
            .Setup(d =>
                d.SendRegistrationEmailAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>()
                )
            )
            .ThrowsAsync(new Exception("smtp down"));
        UserRegisteredNotificationHandler handler = new(
            dispatcherMock.Object,
            Mock.Of<ILogger<UserRegisteredNotificationHandler>>()
        );
        UserRegisteredNotification notification = new(
            Guid.NewGuid(),
            "Aaron",
            "aaron@example.com",
            "token-123"
        );

        Func<Task> act = async () => await handler.Handle(notification, CancellationToken.None);

        await act.Should().NotThrowAsync();
    }
}
