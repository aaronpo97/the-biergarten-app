using Features.Auth.Notifications;
using Features.Emails.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Features.Emails.Notifications;

/// <summary>
///     Handles <see cref="ConfirmationEmailResendRequestedNotification" />, the cross-slice notification
///     published by Features.Users when a user requests a fresh confirmation link, by sending the resend
///     confirmation email.
/// </summary>
public class ConfirmationEmailResendRequestedNotificationHandler(
    IEmailDispatcher emailDispatcher,
    ILogger<ConfirmationEmailResendRequestedNotificationHandler> logger
) : INotificationHandler<ConfirmationEmailResendRequestedNotification>
{
    /// <remarks>
    ///     Delivery failures are logged and swallowed rather than rethrown, so that a broken mail server
    ///     never fails the resend request that already succeeded.
    /// </remarks>
    public async Task Handle(
        ConfirmationEmailResendRequestedNotification notification,
        CancellationToken cancellationToken
    )
    {
        try
        {
            await emailDispatcher.SendResendConfirmationEmailAsync(
                notification.FirstName,
                notification.Email,
                notification.ConfirmationToken
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to send resend confirmation email to user {UserId}",
                notification.UserId
            );
        }
    }
}
