using Features.Users.Dtos;
using Features.Users.Repository;
using MediatR;

namespace Features.Users.Queries.GetFollowStatus;

public class GetFollowStatusHandler(IUserFollowRepository userFollowRepository)
    : IRequestHandler<GetFollowStatusQuery, FollowStatusDto>
{
    public async Task<FollowStatusDto> Handle(
        GetFollowStatusQuery request,
        CancellationToken cancellationToken
    ) =>
        new(
            await userFollowRepository.IsFollowingAsync(
                request.ViewerId,
                request.UserAccountId,
                cancellationToken
            )
        );
}
