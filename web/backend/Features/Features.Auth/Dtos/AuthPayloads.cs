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
