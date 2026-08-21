using Domain.Entities;
using Domain.Exceptions;

namespace Features.UserManagement.Repository;

/// <summary>
///     Repository for CRUD operations on user account records.
/// </summary>
public interface IUserAccountRepository
{
    /// <summary>Returns <c>null</c> if no user account exists with the given ID.</summary>
    Task<UserAccount?> GetByIdAsync(Guid id);

    /// <summary>Returns user accounts ordered by creation date descending.</summary>
    /// <param name="limit"><c>null</c> for no limit.</param>
    /// <param name="offset"><c>null</c> for no offset.</param>
    Task<IEnumerable<UserAccount>> GetAllAsync(int? limit, int? offset);

    /// <summary>Updates the mutable fields of an existing user account.</summary>
    /// <param name="userAccount">Must have a valid <c>UserAccountId</c>.</param>
    /// <exception cref="NotFoundException">Thrown when no user account exists with the given ID.</exception>
    Task UpdateAsync(UserAccount userAccount);

    /// <summary>Deletes the user account with the given ID.</summary>
    /// <exception cref="NotFoundException">Thrown when no user account exists with the given ID.</exception>
    Task DeleteAsync(Guid id);

    /// <summary>Returns <c>null</c> if no user account exists with the given username.</summary>
    Task<UserAccount?> GetByUsernameAsync(string username);

    /// <summary>Returns <c>null</c> if no user account exists with the given email address.</summary>
    Task<UserAccount?> GetByEmailAsync(string email);
}
