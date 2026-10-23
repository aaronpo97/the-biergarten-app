using Features.Users.Dtos;
using MediatR;

namespace Features.Users.Queries.GetFollowing;

public record GetFollowingQuery(Guid UserAccountId, int? Limit, int? Offset)
    : IRequest<IEnumerable<FollowedUserDto>>;
