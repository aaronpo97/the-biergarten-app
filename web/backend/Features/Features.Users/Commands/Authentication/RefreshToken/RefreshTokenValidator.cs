using FluentValidation;

namespace Features.Auth.Commands.Authentication.RefreshToken;

/// <summary>Validates that <see cref="RefreshTokenCommand.RefreshToken" /> is present.</summary>
public class RefreshTokenValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty().WithMessage("Refresh token is required");
    }
}
