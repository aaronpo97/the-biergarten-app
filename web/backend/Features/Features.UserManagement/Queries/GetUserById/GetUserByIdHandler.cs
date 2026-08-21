using Domain.Entities;
using Domain.Exceptions;
using Features.UserManagement.Repository;
using MediatR;

namespace Features.UserManagement.Queries.GetUserById;

/// <summary>
///     Handles <see cref="GetUserByIdQuery" />.
/// </summary>
public class GetUserByIdHandler(IUserAccountRepository repository)
    : IRequestHandler<GetUserByIdQuery, UserAccount>
{
    /// <exception cref="NotFoundException">Thrown when no user account exists with the given ID.</exception>
    public async Task<UserAccount> Handle(
        GetUserByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        UserAccount? user = await repository.GetByIdAsync(request.UserAccountId);
        if (user is null)
            throw new NotFoundException($"User with ID {request.UserAccountId} not found");
        return user;
    }
}
