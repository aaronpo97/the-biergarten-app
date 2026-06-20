using FluentValidation;

namespace Features.Auth.Commands.RefreshToken;

/// <summary>
/// Validates <see cref="RefreshTokenCommand"/> instances before they are processed.
/// </summary>
public class RefreshTokenValidator : AbstractValidator<RefreshTokenCommand>
{
    /// <summary>
    /// Configures a validation rule requiring <see cref="RefreshTokenCommand.RefreshToken"/> to be non-empty.
    /// </summary>
    public RefreshTokenValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty()
            .WithMessage("Refresh token is required");
    }
}
