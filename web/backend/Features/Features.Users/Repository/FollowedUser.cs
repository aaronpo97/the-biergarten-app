namespace Features.Users.Repository;

public record FollowedUser(
    Guid UserAccountId,
    string Username,
    string FirstName,
    string LastName,
    string? AvatarKey,
    DateTime FollowedAt
);
