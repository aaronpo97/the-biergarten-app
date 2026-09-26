using System.Data.Common;
using Dapper;
using Database.Connection;
using Domain.Entities;

namespace Features.Users.Repository;

/// <summary>
///     Dapper-based implementation of <see cref="IUserListRepository" />.
/// </summary>
public class UserListRepository(ISqlConnectionFactory connectionFactory)
    : DapperRepository(connectionFactory),
        IUserListRepository
{
    /// <inheritdoc />
    /// <remarks>
    ///     Left-joins <c>Social.UserProfile</c>, so <see cref="UserAccount.UserProfile" /> is
    ///     <c>null</c> for an account whose profile has yet to be created.
    /// </remarks>
    public async Task<UserAccount?> GetByIdAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        IEnumerable<UserAccount> results = await connection.QueryAsync<
            UserAccount,
            UserProfile,
            UserAccount
        >(
            """
            SELECT 
                ua.UserAccountID, 
                ua.Username, 
                ua.FirstName, ua.LastName, ua.Email, ua.CreatedAt, ua.UpdatedAt,
                ua.DateOfBirth, ua.RowVersion,
                up.UserProfileID, up.UserAccountID, up.Biography, up.RowVersion
            FROM Auth.UserAccount ua
            LEFT JOIN Social.UserProfile up ON ua.UserAccountID = up.UserAccountID
            WHERE ua.UserAccountID = @UserAccountId
            """,
            MapUserRow,
            new { UserAccountId = id },
            splitOn: "UserProfileID"
        );

        return results.SingleOrDefault();
    }

    private static UserAccount MapUserRow(UserAccount user, UserProfile? profile)
    {
        user.UserProfile = profile;
        return user;
    }

    /// <inheritdoc />
    /// <remarks>
    ///     Always applies pagination via <c>OFFSET</c>/<c>FETCH</c>, ordered by creation date descending.
    ///     A <c>null</c> <paramref name="limit" />/<paramref name="offset" /> is treated as "no limit"/"no offset".
    ///     Does not select <c>Email</c> or <c>DateOfBirth</c>: this listing is consumed only as public
    ///     profiles, so those fields are left at their default rather than read from the database.
    /// </remarks>
    public async Task<IEnumerable<UserAccount>> GetAllAsync(int? limit, int? offset)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryAsync<UserAccount>(
            """
            SELECT UserAccountID, Username, FirstName, LastName, CreatedAt, UpdatedAt, RowVersion
            FROM Auth.UserAccount
            ORDER BY CreatedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
            """,
            new { Offset = offset ?? 0, Limit = limit ?? int.MaxValue }
        );
    }
}
