using Domain.Entities;
using Features.UserManagement.Repository;
using MediatR;

namespace Features.UserManagement.Queries.GetAllUsers;

/// <summary>
///     Handles <see cref="GetAllUsersQuery" /> by retrieving a paginated list of user accounts.
/// </summary>
/// <param name="repository">Repository used to query user account data.</param>
public class GetAllUsersHandler(IUserAccountRepository repository)
    : IRequestHandler<GetAllUsersQuery, IEnumerable<UserAccount>>
{
    public Task<IEnumerable<UserAccount>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        return repository.GetAllAsync(request.Limit, request.Offset);
    }
}