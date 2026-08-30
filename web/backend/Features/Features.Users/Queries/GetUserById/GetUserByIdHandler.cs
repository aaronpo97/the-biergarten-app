using Domain.Entities;
using Domain.Exceptions;
using Features.Auth.Repository;
using MediatR;

namespace Features.Auth.Queries.GetUserById;

public class GetUserByIdHandler(IUserListRepository repository)
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
