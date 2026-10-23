using Domain.Entities;
using Features.ImageUploads.Services;
using Features.Users.Repository;

namespace Features.Users.Dtos;

/// <summary>Converts user domain entities into API response models.</summary>
public static class UserDtoMapper
{
    /// <summary>
    ///     How long a presigned avatar URL stays valid. Long enough to outlive the page that embeds it,
    ///     short enough that a leaked URL stops working.
    /// </summary>
    public static readonly TimeSpan AvatarUrlLifetime = TimeSpan.FromHours(1);

    /// <summary>Converts a user account into its public-profile representation.</summary>
    /// <param name="user">The account to convert.</param>
    /// <param name="fileStorageProvider">
    ///     Signs the download URL for the account's avatar. <c>Photo.Hyperlink</c> holds an object key
    ///     rather than a URL, so it has to be signed before a client can fetch it.
    /// </param>
    public static PublicUserProfileDto ToPublicProfileDto(
        this UserAccount user,
        IFileStorageProvider fileStorageProvider
    )
    {
        return new PublicUserProfileDto(
            UserAccountId : user.UserAccountId,
            Username : user.Username,
            FirstName : user.FirstName,
            LastName : user.LastName,
            Biography : user.UserProfile?.Biography ?? string.Empty,
            AvatarUrl : SignAvatarKey(user.UserAvatar?.Photo?.Hyperlink, fileStorageProvider),
            CreatedAt : user.CreatedAt,
            FollowerCount : user.FollowerCount,
            FollowingCount : user.FollowingCount
        );
    }

    public static FollowedUserDto ToFollowedUserDto(
        this FollowedUser followed,
        IFileStorageProvider fileStorageProvider
    ) =>
        new(
            followed.UserAccountId,
            followed.Username,
            followed.FirstName,
            followed.LastName,
            SignAvatarKey(followed.AvatarKey, fileStorageProvider),
            followed.FollowedAt
        );

    private static string SignAvatarKey(string? avatarKey, IFileStorageProvider fileStorageProvider) =>
        string.IsNullOrWhiteSpace(avatarKey)
            ? string.Empty
            : fileStorageProvider.GetPresignedUrl(avatarKey, AvatarUrlLifetime);
}
