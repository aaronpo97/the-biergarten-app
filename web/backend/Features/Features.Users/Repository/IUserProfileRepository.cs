using Domain.Entities;

namespace Features.Auth.Repository;

/// <summary>
///     Repository for user profile records and their avatars.
/// </summary>
public interface IUserProfileRepository
{
    /// <summary>
    ///     Creates a new user profile for <paramref name="userAccountId" /> with the given
    ///     <paramref name="biography" /> and returns its <c>UserProfileID</c>.
    /// </summary>
    Task<Guid> CreateProfileAsync(
        Guid userAccountId,
        string biography,
        CancellationToken cancellationToken
    );

    /// <summary>
    ///     Returns the <c>UserProfileID</c> for <paramref name="userAccountId" />
    /// </summary>
    Task<Guid> GetProfileIdAsync(Guid userAccountId, CancellationToken cancellationToken);

    /// <summary>
    ///     Updates the biography of the user profile belonging to <paramref name="userAccountId" />.
    /// </summary>
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown when no user profile exists for <paramref name="userAccountId" />.
    /// </exception>
    Task UpdateBiographyAsync(
        Guid userAccountId,
        string biography,
        CancellationToken cancellationToken
    );

    /// <summary>
    ///     Persists <paramref name="avatar" />, replacing any existing avatar for the same user profile.
    /// </summary>
    Task SaveAvatarAsync(UserAvatar avatar, CancellationToken cancellationToken);
}
