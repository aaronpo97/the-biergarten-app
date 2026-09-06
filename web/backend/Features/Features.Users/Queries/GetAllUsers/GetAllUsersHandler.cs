using Domain.Entities;
using Features.Users.Repository;
using MediatR;

namespace Features.Users.Queries.GetAllUsers;

public class GetAllUsersHandler(IUserListRepository repository)
    : IRequestHandler<GetAllUsersQuery, IEnumerable<UserAccount>>
{
    public Task<IEnumerable<UserAccount>> Handle(
        GetAllUsersQuery request,
        CancellationToken cancellationToken
    )
    {
        return repository.GetAllAsync(request.Limit, request.Offset);
    }
}
