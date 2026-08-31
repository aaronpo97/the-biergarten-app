using Domain.Entities;
using Features.Auth.Repository;
using MediatR;

namespace Features.Auth.Queries.GetAllUsers;

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
