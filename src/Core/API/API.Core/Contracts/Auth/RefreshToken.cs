using FluentValidation;

namespace API.Core.Contracts.Auth;

public record RefreshTokenRequest
{
    public string RefreshToken { get; init; } = default!;
}

public class RefreshTokenRequestValidator
    : AbstractValidator<RefreshTokenRequest>
{
    public RefreshTokenRequestValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty()
            .WithMessage("Refresh token is required");
    }
}
