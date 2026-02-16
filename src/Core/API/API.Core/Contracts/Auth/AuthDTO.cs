using Domain.Entities;
using Org.BouncyCastle.Asn1.Cms;

namespace API.Core.Contracts.Auth;

public record LoginPayload(
    Guid UserAccountId,
    string Username,
    string RefreshToken,
    string AccessToken
);

public record RegistrationPayload(
    Guid UserAccountId,
    string Username,
    string RefreshToken,
    string AccessToken,
    bool ConfirmationEmailSent
);