namespace Features.Auth.Dtos;

/// <summary>Payload returned to the client after a successful login or token refresh.</summary>
public record LoginPayload(
    Guid UserAccountId,
    string Username,
    string RefreshToken,
    string AccessToken
);

/// <summary>Payload returned to the client after a successful registration.</summary>
public record RegistrationPayload(
    Guid UserAccountId,
    string Username,
    string RefreshToken,
    string AccessToken,
    bool ConfirmationEmailSent
);

/// <summary>Payload returned to the client after a user account's email has been confirmed.</summary>
public record ConfirmationPayload(Guid UserAccountId, DateTime ConfirmedDate);

/// <summary>Request body for changing the authenticated user's username.</summary>
/// <param name="NewUsername">
///     The desired username; must be 3-64 characters and contain only letters, numbers, dots,
///     underscores, and hyphens.
/// </param>
public record UpdateUsernameRequest(string NewUsername);

/// <summary>Payload returned to the client after a username change.</summary>
public record UpdateUsernamePayload(Guid UserAccountId, string Username);

/// <summary>Request body for changing the authenticated user's email address.</summary>
/// <param name="NewEmail">The new email address; up to 128 characters and must be a valid email format.</param>
public record UpdateEmailRequest(string NewEmail);

/// <summary>
///     Payload returned to the client after an email change. The new address is unconfirmed until the
///     user completes the confirmation flow again.
/// </summary>
public record UpdateEmailPayload(Guid UserAccountId, string Email, bool EmailConfirmed);

/// <summary>Request body for updating the authenticated user's profile fields.</summary>
/// <param name="FirstName">The user's first name; up to 128 characters.</param>
/// <param name="LastName">The user's last name; up to 128 characters.</param>
/// <param name="DateOfBirth">The user's date of birth; the user must be at least 19 years old.</param>
public record UpdateProfileRequest(string FirstName, string LastName, DateTime DateOfBirth);

/// <summary>Payload returned to the client after a profile update.</summary>
public record UpdateProfilePayload(
    Guid UserAccountId,
    string FirstName,
    string LastName,
    DateTime DateOfBirth
);

/// <summary>Request body for changing the authenticated user's password.</summary>
/// <param name="CurrentPassword">The user's current plaintext password, verified before the change is applied.</param>
/// <param name="NewPassword">
///     The desired new plaintext password; must be at least 8 characters and contain an uppercase letter, a
///     lowercase letter, a number, and a special character.
/// </param>
public record UpdatePasswordRequest(string CurrentPassword, string NewPassword);

/// <summary>Payload returned to the client after a password change.</summary>
public record UpdatePasswordPayload(Guid UserAccountId, DateTime ChangedAt);
