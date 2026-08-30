using Domain.Entities;

namespace Features.Auth.Repository;

/// <summary>
///     Repository for persisting user avatar records.
/// </summary>
public interface IUserAvatarRepository
{
    /// <summary>
    ///     Persists <paramref name="avatar" />, replacing any existing avatar for the same user profile.
    /// </summary>
    Task SaveAsync(UserAvatar avatar, CancellationToken cancellationToken);
}
