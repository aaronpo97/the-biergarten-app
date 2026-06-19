using API.Core.Contracts.Common;
using FluentValidation;

namespace API.Core.Contracts.Auth;

/// <summary>
/// Request body for the registration endpoint, containing the details needed to create a new user account.
/// </summary>
/// <param name="Username">The desired username; must be 3-64 characters and contain only letters, numbers, dots, underscores, and hyphens.</param>
/// <param name="FirstName">The user's first name; up to 128 characters.</param>
/// <param name="LastName">The user's last name; up to 128 characters.</param>
/// <param name="Email">The user's email address; up to 128 characters and must be a valid email format.</param>
/// <param name="DateOfBirth">The user's date of birth; the user must be at least 19 years old.</param>
/// <param name="Password">The desired plaintext password; must be at least 8 characters and contain an uppercase letter, a lowercase letter, a number, and a special character.</param>
public record RegisterRequest(
    string Username,
    string FirstName,
    string LastName,
    string Email,
    DateTime DateOfBirth,
    string Password
);

/// <summary>
/// Validates <see cref="RegisterRequest"/> instances before they are processed by the registration endpoint.
/// </summary>
public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    /// <summary>
    /// Configures validation rules for username format and length, first/last name length, email format and
    /// length, minimum age based on date of birth, and password strength requirements.
    /// </summary>
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .WithMessage("Username is required")
            .Length(3, 64)
            .WithMessage("Username must be between 3 and 64 characters")
            .Matches("^[a-zA-Z0-9._-]+$")
            .WithMessage(
                "Username can only contain letters, numbers, dots, underscores, and hyphens"
            );

        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage("First name is required")
            .MaximumLength(128)
            .WithMessage("First name cannot exceed 128 characters");

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage("Last name is required")
            .MaximumLength(128)
            .WithMessage("Last name cannot exceed 128 characters");

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required")
            .EmailAddress()
            .WithMessage("Invalid email format")
            .MaximumLength(128)
            .WithMessage("Email cannot exceed 128 characters");

        RuleFor(x => x.DateOfBirth)
            .NotEmpty()
            .WithMessage("Date of birth is required")
            .LessThan(DateTime.Today.AddYears(-19))
            .WithMessage("You must be at least 19 years old to register");

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("Password is required")
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters")
            .Matches("[A-Z]")
            .WithMessage("Password must contain at least one uppercase letter")
            .Matches("[a-z]")
            .WithMessage("Password must contain at least one lowercase letter")
            .Matches("[0-9]")
            .WithMessage("Password must contain at least one number")
            .Matches("[^a-zA-Z0-9]")
            .WithMessage(
                "Password must contain at least one special character"
            );
    }
}
