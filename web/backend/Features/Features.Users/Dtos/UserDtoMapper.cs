using Domain.Entities;

namespace Features.Users.Dtos;

/// <summary>Converts user domain entities into API response models.</summary>
public static class UserDtoMapper
{
    /// <summary>Converts a user account into its public-profile representation.</summary>
    public static PublicUserProfileDto ToPublicProfileDto(this UserAccount user) =>
        new(user.UserAccountId, user.Username, user.FirstName, user.LastName, user.CreatedAt);
}
