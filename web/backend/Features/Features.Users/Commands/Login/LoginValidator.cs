using FluentValidation;

namespace Features.Auth.Commands.Login;

/// <summary>Validates that <see cref="LoginCommand.Username" /> and <see cref="LoginCommand.Password" /> are present.</summary>
public class LoginValidator : AbstractValidator<LoginCommand>
{
    public LoginValidator()
    {
        RuleFor(x => x.Username).NotEmpty().WithMessage("Username is required");

        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required");
    }
}
