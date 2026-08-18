using Domain.Entities;

namespace Features.UserManagement.Repository;

/// <summary>
///     Repository for CRUD operations on user account records.
/// </summary>
public interface IUserAccountRepository
{
    /// <summary>Returns <c>null</c> if no user account exists with the given ID.</summary>
    Task<UserAccount?> GetByIdAsync(Guid id);

    /// <param name="limit"><c>null</c> for no limit.</param>
    /// <param name="offset"><c>null</c> for no offset.</param>
    Task<IEnumerable<UserAccount>> GetAllAsync(int? limit, int? offset);

    /// <param name="userAccount">Must have a valid <c>UserAccountId</c>.</param>
    Task UpdateAsync(UserAccount userAccount);

    Task DeleteAsync(Guid id);

    /// <summary>Returns <c>null</c> if no user account exists with the given username.</summary>
    Task<UserAccount?> GetByUsernameAsync(string username);

    /// <summary>Returns <c>null</c> if no user account exists with the given email address.</summary>
    Task<UserAccount?> GetByEmailAsync(string email);
}
