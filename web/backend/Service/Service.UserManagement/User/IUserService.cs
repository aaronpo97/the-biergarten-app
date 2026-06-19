using Domain.Entities;

namespace Service.UserManagement.User;

/// <summary>
/// Defines operations for retrieving and updating user accounts.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Retrieves all user accounts, optionally paginated.
    /// </summary>
    /// <param name="limit">The maximum number of results to return, or <c>null</c> for no limit.</param>
    /// <param name="offset">The number of results to skip, or <c>null</c> to start from the beginning.</param>
    /// <returns>A collection of <see cref="UserAccount"/> entities.</returns>
    Task<IEnumerable<UserAccount>> GetAllAsync(
        int? limit = null,
        int? offset = null
    );

    /// <summary>
    /// Retrieves a user account by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the user account.</param>
    /// <returns>The matching <see cref="UserAccount"/>.</returns>
    Task<UserAccount> GetByIdAsync(Guid id);

    /// <summary>
    /// Updates an existing user account.
    /// </summary>
    /// <param name="userAccount">The user account containing the updated data.</param>
    /// <returns>A task that completes once the update has finished.</returns>
    Task UpdateAsync(UserAccount userAccount);
}
