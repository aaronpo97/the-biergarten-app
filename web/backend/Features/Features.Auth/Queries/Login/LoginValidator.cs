using FluentValidation;

namespace Features.Auth.Queries.Login;

/// <summary>
///     Validates <see cref="LoginQuery" /> instances before they are processed.
/// </summary>
public class LoginValidator : AbstractValidator<LoginQuery>
{
    /// <summary>
    ///     Configures validation rules requiring both <see cref="LoginQuery.Username" /> and
    ///     <see cref="LoginQuery.Password" /> to be non-empty.
    /// </summary>
    public LoginValidator()
    {
        RuleFor(x => x.Username).NotEmpty().WithMessage("Username is required");

        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required");
    }
}
