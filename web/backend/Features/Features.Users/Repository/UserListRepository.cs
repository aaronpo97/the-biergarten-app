using System.Data.Common;
using Dapper;
using Database.Connection;
using Domain.Entities;

namespace Features.Auth.Repository;

/// <summary>
///     Dapper-based implementation of <see cref="IUserListRepository" />.
/// </summary>
public class UserListRepository(ISqlConnectionFactory connectionFactory)
    : DapperRepository(connectionFactory),
        IUserListRepository
{
    /// <inheritdoc />
    public async Task<UserAccount?> GetByIdAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<UserAccount>(
            """
            SELECT 
                UserAccountID, 
                Username, 
                FirstName, LastName, Email, CreatedAt, UpdatedAt, DateOfBirth, RowVersion
            FROM dbo.UserAccount
            WHERE UserAccountID = @UserAccountId
            """,
            new { UserAccountId = id }
        );
    }

    /// <inheritdoc />
    /// <remarks>
    ///     Always applies pagination via <c>OFFSET</c>/<c>FETCH</c>, ordered by creation date descending.
    ///     A <c>null</c> <paramref name="limit" />/<paramref name="offset" /> is treated as "no limit"/"no offset".
    /// </remarks>
    public async Task<IEnumerable<UserAccount>> GetAllAsync(int? limit, int? offset)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryAsync<UserAccount>(
            """
            SELECT UserAccountID, Username, FirstName, LastName, Email, CreatedAt, UpdatedAt, DateOfBirth, RowVersion
            FROM dbo.UserAccount
            ORDER BY CreatedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
            """,
            new { Offset = offset ?? 0, Limit = limit ?? int.MaxValue }
        );
    }
}
