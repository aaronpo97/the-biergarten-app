using Features.UserManagement.Repository;
using MediatR;

namespace Features.UserManagement.Commands.UpdateUser;

/// <summary>
///     Handles <see cref="UpdateUserCommand" /> by persisting changes to an existing user account.
/// </summary>
/// <param name="repository">Repository used to persist the updated user account.</param>
public class UpdateUserHandler(IUserAccountRepository repository)
    : IRequestHandler<UpdateUserCommand>
{
    public Task Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        return repository.UpdateAsync(request.UserAccount);
    }
}