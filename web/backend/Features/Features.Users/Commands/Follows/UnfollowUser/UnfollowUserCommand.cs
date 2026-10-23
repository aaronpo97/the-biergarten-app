using MediatR;

namespace Features.Users.Commands.Follows.UnfollowUser;

public record UnfollowUserCommand(Guid FollowerId, Guid FollowingId) : IRequest;
