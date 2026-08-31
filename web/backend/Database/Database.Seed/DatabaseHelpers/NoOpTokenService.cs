using Features.Auth.Services;

namespace Database.Seed.DatabaseHelpers;

public class NoOpTokenService : ITokenService
{
    public string GenerateAccessToken(Guid userId, string username) => string.Empty;

    public string GenerateRefreshToken(Guid userId, string username) => string.Empty;

    public string GenerateConfirmationToken(Guid userId, string username) => string.Empty;

    public Task<ValidatedToken> ValidateRefreshTokenAsync(string token) =>
        throw new NotSupportedException("Token validation is not supported during seeding.");

    public Task<ValidatedToken> ValidateConfirmationTokenAsync(string token) =>
        throw new NotSupportedException("Token validation is not supported during seeding.");

    public Task<RefreshTokenResult> RefreshTokenAsync(string refreshTokenString) =>
        throw new NotSupportedException("Token validation is not supported during seeding.");
}
