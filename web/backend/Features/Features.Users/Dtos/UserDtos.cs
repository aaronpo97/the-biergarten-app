namespace Features.Users.Dtos;

/// <summary>Represents the subset of a user account that is safe to expose on a public profile.</summary>
public record PublicUserProfileDto(
    Guid UserAccountId,
    string Username,
    string FirstName,
    string LastName,
    DateTime CreatedAt
);
