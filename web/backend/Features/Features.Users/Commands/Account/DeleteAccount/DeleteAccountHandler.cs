using Domain.Exceptions;
using Features.Auth.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Features.Auth.Commands.Account.DeleteAccount;

/// <summary>Handles <see cref="DeleteAccountCommand" /> by deleting the user via <see cref="UserManager{TUser}" />.</summary>
public class DeleteAccountHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<DeleteAccountCommand>
{
    /// <exception cref="NotFoundException">Thrown when the account does not exist.</exception>
    /// <exception cref="ConflictException">
    ///     Thrown when the account cannot be deleted because other records (posts, comments, photos,
    ///     follows) still reference it.
    /// </exception>
    public async Task Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        ApplicationUser user =
            await userManager.FindByIdAsync(request.UserAccountId.ToString())
            ?? throw new NotFoundException("User account not found");

        IdentityResult result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e.Code == "AccountHasDependentRecords"))
                throw new ConflictException(
                    "Account cannot be deleted while it still has associated posts, comments, photos, or follows."
                );
            throw new ConflictException(
                string.Join("; ", result.Errors.Select(e => e.Description))
            );
        }
    }
}
