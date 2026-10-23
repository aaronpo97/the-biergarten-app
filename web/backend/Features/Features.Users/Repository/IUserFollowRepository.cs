namespace Features.Users.Repository;

public interface IUserFollowRepository
{
    Task FollowAsync(Guid followerId, Guid followingId, CancellationToken cancellationToken);

    Task UnfollowAsync(Guid followerId, Guid followingId, CancellationToken cancellationToken);

    Task<bool> IsFollowingAsync(Guid followerId, Guid followingId, CancellationToken cancellationToken);
}
