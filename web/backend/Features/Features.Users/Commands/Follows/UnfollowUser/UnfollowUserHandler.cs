using Features.Users.Repository;
using MediatR;

namespace Features.Users.Commands.Follows.UnfollowUser;

public class UnfollowUserHandler(IUserFollowRepository userFollowRepository)
    : IRequestHandler<UnfollowUserCommand>
{
    public Task Handle(UnfollowUserCommand request, CancellationToken cancellationToken) =>
        userFollowRepository.UnfollowAsync(
            request.FollowerId,
            request.FollowingId,
            cancellationToken
        );
}
