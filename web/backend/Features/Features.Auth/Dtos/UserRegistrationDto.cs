namespace Features.Auth.Dtos;

public record UserRegistrationDto(
    string Username,
    string FirstName,
    string LastName,
    string Email,
    DateTime DateOfBirth,
    string PasswordHash
);
