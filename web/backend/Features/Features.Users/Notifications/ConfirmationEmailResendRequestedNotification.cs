using MediatR;

namespace Features.Auth.Notifications;

/// <summary>
///     Published after a user requests a fresh confirmation link. Handled by Features.Emails to send the
///     resend confirmation email.
/// </summary>
public record ConfirmationEmailResendRequestedNotification(
    Guid UserId,
    string FirstName,
    string Email,
    string ConfirmationToken
) : INotification;
