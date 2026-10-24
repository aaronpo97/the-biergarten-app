using Domain.Exceptions;
using Features.ImageUploads.Services;
using Features.Users.Dtos;
using Features.Users.Identity;
using Features.Users.Repository;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Features.Users.Queries.GetFollowing;

public class GetFollowingHandler(
    UserManager<ApplicationUser> userManager,
    IUserListRepository userListRepository,
    IFileStorageProvider fileStorageProvider
) : IRequestHandler<GetFollowingQuery, IEnumerable<FollowedUserDto>>
{
    public const int DefaultLimit = 50;
    public const int MaxLimit = 100;

    public async Task<IEnumerable<FollowedUserDto>> Handle(
        GetFollowingQuery request,
        CancellationToken cancellationToken
    )
    {
        ApplicationUser? user = await userManager.FindByIdAsync(request.UserAccountId.ToString());
        if (user is null)
            throw new NotFoundException($"User with ID {request.UserAccountId} not found");

        int limit = Math.Clamp(request.Limit ?? DefaultLimit, 1, MaxLimit);
        int offset = Math.Max(request.Offset ?? 0, 0);

        IEnumerable<FollowedUser> following = await userListRepository.GetFollowingAsync(
            request.UserAccountId,
            limit,
            offset
        );
        return following.Select(f => f.ToFollowedUserDto(fileStorageProvider)).ToList();
    }
}
