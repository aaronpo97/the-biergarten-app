namespace Features.Auth.Dtos;

/// <summary>
///     Payload returned to the client after a successful login or token refresh.
/// </summary>
/// <param name="UserAccountId">The unique identifier of the authenticated user account.</param>
/// <param name="Username">The username of the authenticated user account.</param>
/// <param name="RefreshToken">The newly issued refresh token used to obtain new access tokens.</param>
/// <param name="AccessToken">The newly issued JWT access token used to authorize subsequent requests.</param>
public record LoginPayload(
    Guid UserAccountId,
    string Username,
    string RefreshToken,
    string AccessToken
);

/// <summary>
///     Payload returned to the client after a successful registration.
/// </summary>
/// <param name="UserAccountId">The unique identifier of the newly created user account.</param>
/// <param name="Username">The username of the newly created user account.</param>
/// <param name="RefreshToken">The refresh token issued for the new account.</param>
/// <param name="AccessToken">The JWT access token issued for the new account.</param>
/// <param name="ConfirmationEmailSent">Whether a confirmation email was successfully sent to the new user.</param>
public record RegistrationPayload(
    Guid UserAccountId,
    string Username,
    string RefreshToken,
    string AccessToken,
    bool ConfirmationEmailSent
);

/// <summary>
///     Payload returned to the client after a user account's email has been confirmed.
/// </summary>
/// <param name="UserAccountId">The unique identifier of the user account that was confirmed.</param>
/// <param name="ConfirmedDate">The date and time at which the account was confirmed.</param>
public record ConfirmationPayload(Guid UserAccountId, DateTime ConfirmedDate);