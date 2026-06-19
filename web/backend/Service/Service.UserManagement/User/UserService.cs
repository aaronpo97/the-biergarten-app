using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Repository.UserAccount;

namespace Service.UserManagement.User;

/// <summary>
/// Handles retrieval and update of user accounts.
/// </summary>
/// <param name="repository">Repository used to persist and query user account data.</param>
public class UserService(IUserAccountRepository repository) : IUserService
{
    /// <summary>
    /// Retrieves all user accounts, optionally paginated.
    /// </summary>
    /// <param name="limit">The maximum number of results to return, or <c>null</c> for no limit.</param>
    /// <param name="offset">The number of results to skip, or <c>null</c> to start from the beginning.</param>
    /// <returns>A collection of <see cref="UserAccount"/> entities.</returns>
    public async Task<IEnumerable<UserAccount>> GetAllAsync(
        int? limit = null,
        int? offset = null
    )
    {
        return await repository.GetAllAsync(limit, offset);
    }

    /// <summary>
    /// Retrieves a user account by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the user account.</param>
    /// <returns>The matching <see cref="UserAccount"/>.</returns>
    /// <exception cref="NotFoundException">Thrown when no user account exists with the given <paramref name="id"/>.</exception>
    public async Task<UserAccount> GetByIdAsync(Guid id)
    {
        var user = await repository.GetByIdAsync(id);
        if (user is null)
            throw new NotFoundException($"User with ID {id} not found");
        return user;
    }

    /// <summary>
    /// Updates an existing user account.
    /// </summary>
    /// <param name="userAccount">The user account containing the updated data.</param>
    /// <returns>A task that completes once the update has finished.</returns>
    public async Task UpdateAsync(UserAccount userAccount)
    {
        await repository.UpdateAsync(userAccount);
    }
}
