using System.Data.Common;
using Dapper;
using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Sql;

namespace Features.UserManagement.Repository;

/// <summary>
///     Dapper-based implementation of <see cref="IUserAccountRepository" />.
/// </summary>
public class UserAccountRepository(ISqlConnectionFactory connectionFactory)
    : Repository<UserAccount>(connectionFactory),
        IUserAccountRepository
{
    /// <inheritdoc />
    public async Task<UserAccount?> GetByIdAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<UserAccount>(
            """
            SELECT UserAccountID, Username, FirstName, LastName, Email, CreatedAt, UpdatedAt, DateOfBirth, RowVersion
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

    /// <inheritdoc />
    public async Task UpdateAsync(UserAccount userAccount)
    {
        await using DbConnection connection = await CreateConnection();
        int rows = await connection.ExecuteAsync(
            """
            UPDATE dbo.UserAccount
            SET Username = @Username, FirstName = @FirstName, LastName = @LastName,
                DateOfBirth = @DateOfBirth, Email = @Email
            WHERE UserAccountId = @UserAccountId
            """,
            new
            {
                UserAccountId = userAccount.UserAccountId,
                userAccount.Username,
                userAccount.FirstName,
                userAccount.LastName,
                userAccount.DateOfBirth,
                userAccount.Email,
            }
        );

        if (rows == 0)
            throw new NotFoundException("User account not found.");
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        int rows = await connection.ExecuteAsync(
            """
            DELETE FROM dbo.UserAccount
            WHERE UserAccountId = @UserAccountId
            """,
            new { UserAccountId = id }
        );

        if (rows == 0)
            throw new NotFoundException("User account not found.");
    }

    /// <inheritdoc />
    public async Task<UserAccount?> GetByUsernameAsync(string username)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<UserAccount>(
            """
            SELECT UserAccountID, Username, FirstName, LastName, Email, CreatedAt, UpdatedAt, DateOfBirth, RowVersion
            FROM dbo.UserAccount
            WHERE Username = @Username
            """,
            new { Username = username }
        );
    }

    /// <inheritdoc />
    public async Task<UserAccount?> GetByEmailAsync(string email)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<UserAccount>(
            """
            SELECT UserAccountID, Username, FirstName, LastName, Email, CreatedAt, UpdatedAt, DateOfBirth, RowVersion
            FROM dbo.UserAccount
            WHERE Email = @Email
            """,
            new { Email = email }
        );
    }
}
