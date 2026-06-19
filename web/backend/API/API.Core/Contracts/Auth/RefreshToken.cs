using FluentValidation;

namespace API.Core.Contracts.Auth;

/// <summary>
/// Request body for the token refresh endpoint, containing the refresh token used to obtain a new access token.
/// </summary>
public record RefreshTokenRequest
{
    /// <summary>
    /// The refresh token previously issued to the client during login, registration, or a prior refresh.
    /// </summary>
    public string RefreshToken { get; init; } = default!;
}

/// <summary>
/// Validates <see cref="RefreshTokenRequest"/> instances before they are processed by the refresh endpoint.
/// </summary>
public class RefreshTokenRequestValidator
    : AbstractValidator<RefreshTokenRequest>
{
    /// <summary>
    /// Configures a validation rule requiring <see cref="RefreshTokenRequest.RefreshToken"/> to be non-empty.
    /// </summary>
    public RefreshTokenRequestValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty()
            .WithMessage("Refresh token is required");
    }
}
