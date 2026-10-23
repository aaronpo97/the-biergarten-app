using Features.Users.Dtos;
using MediatR;

namespace Features.Users.Queries.GetFollowStatus;

public record GetFollowStatusQuery(Guid ViewerId, Guid UserAccountId) : IRequest<FollowStatusDto>;
