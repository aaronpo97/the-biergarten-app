using Domain.Entities;
using Features.UserManagement.Repository;
using MediatR;

namespace Features.UserManagement.Queries.GetAllUsers;

public class GetAllUsersHandler(IUserAccountRepository repository)
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
