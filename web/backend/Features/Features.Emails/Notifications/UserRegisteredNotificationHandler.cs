using Features.Emails.Services;
using Features.Users.Notifications;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Features.Emails.Notifications;

/// <summary>
///     Handles <see cref="UserRegisteredNotification" />, the cross-slice notification published by
///     Features.Users after a new user registers, by sending the registration confirmation email.
/// </summary>
public class UserRegisteredNotificationHandler(
    IEmailDispatcher emailDispatcher,
    ILogger<UserRegisteredNotificationHandler> logger
) : INotificationHandler<UserRegisteredNotification>
{
    /// <remarks>
    ///     Delivery failures are logged and swallowed rather than rethrown, so that a broken mail server
    ///     never fails the registration that already succeeded.
    /// </remarks>
    public async Task Handle(UserRegisteredNotification notification, CancellationToken cancellationToken)
    {
        try
        {
            await emailDispatcher.SendRegistrationEmailAsync(
                notification.FirstName,
                notification.Email,
                notification.ConfirmationToken
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to send registration confirmation email to user {UserId}",
                notification.UserId
            );
        }
    }
}
