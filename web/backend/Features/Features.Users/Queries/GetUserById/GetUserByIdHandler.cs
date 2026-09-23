using Domain.Entities;
using Domain.Exceptions;
using Features.Users.Repository;
using MediatR;

namespace Features.Users.Queries.GetUserById;

public class GetUserByIdHandler(IUserListRepository repository)
    : IRequestHandler<GetUserByIdQuery, UserAccount>
{
    /// <exception cref="ForbiddenException">
    /// Thrown when the caller requests an account other than their own.
    /// </exception>
    /// <exception cref="NotFoundException">Thrown when no user account exists with the given ID.</exception>
    public async Task<UserAccount> Handle(
        GetUserByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        if (request.UserAccountId != request.RequestingUserId)
            throw new ForbiddenException("You are not authorized to view this account.");

        UserAccount? user = await repository.GetByIdAsync(request.UserAccountId);
        if (user is null)
            throw new NotFoundException($"User with ID {request.UserAccountId} not found");
        return user;
    }
}
