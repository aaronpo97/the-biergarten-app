using Domain.Exceptions;
using Features.Users.Identity;
using Features.Users.Repository;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Features.Users.Commands.Follows.FollowUser;

public class FollowUserHandler(
    UserManager<ApplicationUser> userManager,
    IUserFollowRepository userFollowRepository
) : IRequestHandler<FollowUserCommand>
{
    public async Task Handle(FollowUserCommand request, CancellationToken cancellationToken)
    {
        if (request.FollowerId == request.FollowingId)
            throw new ValidationException("You cannot follow your own account");

        ApplicationUser? target = await userManager.FindByIdAsync(request.FollowingId.ToString());
        if (target is null)
            throw new NotFoundException($"User with ID {request.FollowingId} not found");

        await userFollowRepository.FollowAsync(
            request.FollowerId,
            request.FollowingId,
            cancellationToken
        );
    }
}
