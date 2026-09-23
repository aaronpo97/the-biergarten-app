using Domain.Entities;
using Domain.Exceptions;
using Features.Users.Dtos;
using Features.Users.Repository;
using MediatR;

namespace Features.Users.Queries.GetPublicUserProfileById;

public class GetPublicUserProfileByIdHandler(IUserListRepository repository)
    : IRequestHandler<GetPublicUserProfileByIdQuery, PublicUserProfileDto>
{
    /// <exception cref="NotFoundException">Thrown when no user account exists with the given ID.</exception>
    public async Task<PublicUserProfileDto> Handle(
        GetPublicUserProfileByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        UserAccount? user = await repository.GetByIdAsync(request.UserAccountId);
        if (user is null)
            throw new NotFoundException($"User with ID {request.UserAccountId} not found");
        return user.ToPublicProfileDto();
    }
}
