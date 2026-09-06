using MediatR;

namespace Features.Auth.Notifications;

/// <summary>
///     Published after a new user registers. Handled by Features.Emails to send the registration
///     confirmation email.
/// </summary>
public record UserRegisteredNotification(
    Guid UserId,
    string FirstName,
    string Email,
    string ConfirmationToken
) : INotification;
