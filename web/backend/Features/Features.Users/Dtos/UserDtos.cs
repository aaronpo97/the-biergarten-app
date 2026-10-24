namespace Features.Users.Dtos;

/// <summary>Represents the subset of a user account that is safe to expose on a public profile.</summary>
public record PublicUserProfileDto(
    Guid UserAccountId,
    string Username,
    string FirstName,
    string LastName,
    string Biography,
    string AvatarUrl,
    DateTime CreatedAt,
    int FollowerCount,
    int FollowingCount
);

public record FollowedUserDto(
    Guid UserAccountId,
    string Username,
    string FirstName,
    string LastName,
    string AvatarUrl,
    DateTime FollowedAt
);

public record FollowStatusDto(bool IsFollowing);
