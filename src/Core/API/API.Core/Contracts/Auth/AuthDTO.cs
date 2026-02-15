using Domain.Entities;
using Org.BouncyCastle.Asn1.Cms;

namespace API.Core.Contracts.Auth;

public record AuthPayload(
    Guid UserAccountId,
    string Username,
    string RefreshToken,
    string AccessToken
);
