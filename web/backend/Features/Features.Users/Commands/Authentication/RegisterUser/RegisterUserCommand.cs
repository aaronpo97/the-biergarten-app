using Features.Auth.Dtos;
using MediatR;

namespace Features.Auth.Commands.Authentication.RegisterUser;

/// <summary>
///     Registers a new user account. Bound directly from the request body of <c>POST /api/auth/register</c>.
/// </summary>
/// <param name="Username">
///     The desired username; must be 3-64 characters and contain only letters, numbers, dots,
///     underscores, and hyphens.
/// </param>
/// <param name="FirstName">The user's first name; up to 128 characters.</param>
/// <param name="LastName">The user's last name; up to 128 characters.</param>
/// <param name="Email">The user's email address; up to 128 characters and must be a valid email format.</param>
/// <param name="DateOfBirth">The user's date of birth; the user must be at least 19 years old.</param>
/// <param name="Password">
///     The desired plaintext password; must be at least 8 characters and contain an uppercase letter, a
///     lowercase letter, a number, and a special character.
/// </param>
public record RegisterUserCommand(
    string Username,
    string FirstName,
    string LastName,
    string Email,
    DateTime DateOfBirth,
    string Password
) : IRequest<RegistrationPayload>;
