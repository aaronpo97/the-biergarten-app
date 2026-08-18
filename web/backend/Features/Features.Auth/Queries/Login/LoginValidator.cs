using FluentValidation;

namespace Features.Auth.Queries.Login;

/// <summary>Validates that <see cref="LoginQuery.Username" /> and <see cref="LoginQuery.Password" /> are present.</summary>
public class LoginValidator : AbstractValidator<LoginQuery>
{
    public LoginValidator()
    {
        RuleFor(x => x.Username).NotEmpty().WithMessage("Username is required");

        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required");
    }
}
