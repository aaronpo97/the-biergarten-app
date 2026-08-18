namespace Features.Auth.Dtos;

/// <summary>Data required to persist a new user account and its initial credential.</summary>
/// <param name="PasswordHash">The already-hashed password; never a plaintext value.</param>
public record UserRegistrationDto(
    string Username,
    string FirstName,
    string LastName,
    string Email,
    DateTime DateOfBirth,
    string PasswordHash
);
