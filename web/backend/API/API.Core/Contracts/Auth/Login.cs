using API.Core.Contracts.Common;
using FluentValidation;

namespace API.Core.Contracts.Auth;

/// <summary>
/// Request body for the login endpoint, containing the credentials used to authenticate a user.
/// </summary>
public record LoginRequest
{
    /// <summary>
    /// The username of the account attempting to log in.
    /// </summary>
    public string Username { get; init; } = default!;

    /// <summary>
    /// The plaintext password of the account attempting to log in.
    /// </summary>
    public string Password { get; init; } = default!;
}

/// <summary>
/// Validates <see cref="LoginRequest"/> instances before they are processed by the login endpoint.
/// </summary>
public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    /// <summary>
    /// Configures validation rules requiring both <see cref="LoginRequest.Username"/> and
    /// <see cref="LoginRequest.Password"/> to be non-empty.
    /// </summary>
    public LoginRequestValidator()
    {
        RuleFor(x => x.Username).NotEmpty().WithMessage("Username is required");

        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required");
    }
}
