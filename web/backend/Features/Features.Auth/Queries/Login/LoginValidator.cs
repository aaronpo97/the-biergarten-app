using FluentValidation;

namespace Features.Auth.Queries.Login;

public class LoginValidator : AbstractValidator<LoginQuery>
{
    public LoginValidator()
    {
        RuleFor(x => x.Username).NotEmpty().WithMessage("Username is required");

        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required");
    }
}
