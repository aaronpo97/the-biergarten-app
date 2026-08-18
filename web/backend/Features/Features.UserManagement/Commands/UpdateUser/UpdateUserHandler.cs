using Features.UserManagement.Repository;
using MediatR;

namespace Features.UserManagement.Commands.UpdateUser;

/// <summary>
///     Handles <see cref="UpdateUserCommand" />.
/// </summary>
public class UpdateUserHandler(IUserAccountRepository repository)
    : IRequestHandler<UpdateUserCommand>
{
    public Task Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        return repository.UpdateAsync(request.UserAccount);
    }
}
