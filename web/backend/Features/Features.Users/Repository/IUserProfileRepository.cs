namespace Features.Auth.Repository;

/// <summary>
///     Repository for resolving user profile records.
/// </summary>
public interface IUserProfileRepository
{
    /// <summary>
    ///     Returns the <c>UserProfileID</c> for <paramref name="userAccountId" />, creating an empty
    ///     profile first if one doesn't already exist.
    /// </summary>
    Task<Guid> GetOrCreateProfileIdAsync(Guid userAccountId, CancellationToken cancellationToken);
}
