using Domain.Entities;

namespace Features.UserManagement.Repository;

/// <summary>
///     Repository for CRUD operations on user account records.
/// </summary>
public interface IUserAccountRepository
{
    /// <summary>
    ///     Retrieves a user account by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the user account.</param>
    /// <returns>The matching <see cref="Domain.Entities.UserAccount" />, or <c>null</c> if not found.</returns>
    Task<UserAccount?> GetByIdAsync(Guid id);

    /// <summary>
    ///     Retrieves all user accounts, optionally paginated.
    /// </summary>
    /// <param name="limit">The maximum number of records to return, or <c>null</c> for no limit.</param>
    /// <param name="offset">The number of records to skip, or <c>null</c> for no offset.</param>
    /// <returns>The collection of matching <see cref="Domain.Entities.UserAccount" /> records.</returns>
    Task<IEnumerable<UserAccount>> GetAllAsync(int? limit, int? offset);

    /// <summary>
    ///     Updates an existing user account's details.
    /// </summary>
    /// <param name="userAccount">The user account containing updated values. Must have a valid <c>UserAccountId</c>.</param>
    Task UpdateAsync(UserAccount userAccount);

    /// <summary>
    ///     Deletes a user account by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the user account to delete.</param>
    Task DeleteAsync(Guid id);

    /// <summary>
    ///     Retrieves a user account by username.
    /// </summary>
    /// <param name="username">The username to search for.</param>
    /// <returns>The matching <see cref="Domain.Entities.UserAccount" />, or <c>null</c> if not found.</returns>
    Task<UserAccount?> GetByUsernameAsync(string username);

    /// <summary>
    ///     Retrieves a user account by email address.
    /// </summary>
    /// <param name="email">The email address to search for.</param>
    /// <returns>The matching <see cref="Domain.Entities.UserAccount" />, or <c>null</c> if not found.</returns>
    Task<UserAccount?> GetByEmailAsync(string email);
}
