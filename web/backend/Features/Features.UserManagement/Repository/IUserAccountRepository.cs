using Domain.Entities;

namespace Features.UserManagement.Repository;

/// <summary>
///     Repository for CRUD operations on user account records.
/// </summary>
public interface IUserAccountRepository
{
    /// <summary>
    ///     Retrieves a user account by its unique identifier, or <c>null</c> if not found.
    /// </summary>
    Task<UserAccount?> GetByIdAsync(Guid id);

    /// <summary>
    ///     Retrieves all user accounts, optionally paginated.
    /// </summary>
    /// <param name="limit"><c>null</c> for no limit.</param>
    /// <param name="offset"><c>null</c> for no offset.</param>
    Task<IEnumerable<UserAccount>> GetAllAsync(int? limit, int? offset);

    /// <param name="userAccount">Must have a valid <c>UserAccountId</c>.</param>
    Task UpdateAsync(UserAccount userAccount);

    Task DeleteAsync(Guid id);

    /// <summary>
    ///     Retrieves a user account by username, or <c>null</c> if not found.
    /// </summary>
    Task<UserAccount?> GetByUsernameAsync(string username);

    /// <summary>
    ///     Retrieves a user account by email address, or <c>null</c> if not found.
    /// </summary>
    Task<UserAccount?> GetByEmailAsync(string email);
}
