using Domain.Entities;

namespace Features.Auth.Repository;

/// <summary>
///     Read access for user account listing. Everything else on user accounts (lookup by
///     username/email, create/update/delete) already goes through
///     <see cref="Microsoft.AspNetCore.Identity.UserManager{TUser}" />; this repository only covers
///     what <c>IUserStore</c> has no equivalent for: fetching by ID with full audit fields, and
///     paginated listing.
/// </summary>
public interface IUserListRepository
{
    /// <summary>Returns <c>null</c> if no user account exists with the given ID.</summary>
    Task<UserAccount?> GetByIdAsync(Guid id);

    /// <summary>Returns user accounts ordered by creation date descending.</summary>
    /// <param name="limit"><c>null</c> for no limit.</param>
    /// <param name="offset"><c>null</c> for no offset.</param>
    Task<IEnumerable<UserAccount>> GetAllAsync(int? limit, int? offset);
}
