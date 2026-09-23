using Domain.Entities;
using Features.Users.Dtos;
using Features.Users.Repository;
using MediatR;

namespace Features.Users.Queries.GetAllUsers;

public class GetAllUsersHandler(IUserListRepository repository)
    : IRequestHandler<GetAllUsersQuery, IEnumerable<PublicUserProfileDto>>
{
    public async Task<IEnumerable<PublicUserProfileDto>> Handle(
        GetAllUsersQuery request,
        CancellationToken cancellationToken
    )
    {
        IEnumerable<UserAccount> users = await repository.GetAllAsync(request.Limit, request.Offset);
        return users.Select(user => user.ToPublicProfileDto());
    }
}
