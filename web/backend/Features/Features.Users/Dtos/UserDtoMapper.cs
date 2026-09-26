using Domain.Entities;

namespace Features.Users.Dtos;

/// <summary>Converts user domain entities into API response models.</summary>
public static class UserDtoMapper
{
    /// <summary>Converts a user account into its public-profile representation.</summary>
    public static PublicUserProfileDto ToPublicProfileDto(this UserAccount user)
    {
        return new PublicUserProfileDto(
            UserAccountId : user.UserAccountId,
            Username : user.Username,
            FirstName : user.FirstName,
            LastName : user.LastName,
            Biography : user.UserProfile?.Biography ?? string.Empty,
            CreatedAt : user.CreatedAt
        );
    }
}
