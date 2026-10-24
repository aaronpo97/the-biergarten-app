using MediatR;

namespace Features.Users.Commands.Follows.FollowUser;

public record FollowUserCommand(Guid FollowerId, Guid FollowingId) : IRequest;
