using System.Data.Common;
using Dapper;
using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Sql;
using Microsoft.Data.SqlClient;

namespace Features.Auth.Repository;

/// <summary>
///     Dapper-based implementation of <see cref="IAuthRepository" />, handling user registration,
///     credential lookup/rotation, and account verification.
/// </summary>
public class AuthRepository(ISqlConnectionFactory connectionFactory)
    : Repository<UserAccount>(connectionFactory),
        IAuthRepository
{
    /// <inheritdoc />
    /// <remarks>The account and credential are inserted within a single database transaction.</remarks>
    public async Task<UserAccount> RegisterUserAsync(UserAccount ua)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction = await connection.BeginTransactionAsync();


        Guid userAccountId;

        try
        {
            userAccountId = await connection.ExecuteScalarAsync<Guid>(
                new CommandDefinition(
                    """
                    INSERT INTO dbo.UserAccount (Username, FirstName, LastName, DateOfBirth, Email)
                    OUTPUT INSERTED.UserAccountID
                    VALUES (@Username, @FirstName, @LastName, @DateOfBirth, @Email);
                    """,
                    new { ua.Username, ua.FirstName, ua.LastName, ua.DateOfBirth, ua.Email},
                    transaction
                )
            );

            int credentialRows = await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    INSERT INTO dbo.UserCredential (UserAccountId, Hash)
                    VALUES (@UserAccountId, @Hash);
                    """,
                    new { UserAccountId = userAccountId, ua.UserCredential?.Hash },
                    transaction
                )
            );

            if (credentialRows == 0)
                throw new InvalidOperationException("Failed to create user credential.");

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        // perform round trip to get new User entity
        return await GetUserByIdAsync(userAccountId)
            ?? throw new Exception("Failed to retrieve newly registered user.");
    }

    /// <inheritdoc />
    public async Task<UserAccount?> GetUserByEmailAsync(string email)
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

    /// <inheritdoc />
    public async Task<UserAccount?> GetUserByUsernameAsync(string username)
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
    public async Task<UserCredential?> GetActiveCredentialByUserAccountIdAsync(Guid userAccountId)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<UserCredential>(
            """
            SELECT UserCredentialId, UserAccountId, Hash, CreatedAt, RowVersion
            FROM dbo.UserCredential
            WHERE UserAccountId = @UserAccountId AND IsRevoked = 0
            """,
            new { UserAccountId = userAccountId }
        );
    }

    /// <inheritdoc />
    public async Task RotateCredentialAsync(Guid userAccountId, string newPasswordHash)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction = await connection.BeginTransactionAsync();

        try
        {
            bool exists =
                await connection.ExecuteScalarAsync<int?>(
                    new CommandDefinition(
                        """
                        SELECT 1
                        FROM dbo.UserAccount
                        WHERE UserAccountID = @UserAccountId
                        """,
                        new { UserAccountId = userAccountId },
                        transaction
                    )
                ) is not null;

            if (!exists)
                throw new NotFoundException("User account not found.");

            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    UPDATE dbo.UserCredential
                    SET IsRevoked = 1, RevokedAt = GETDATE()
                    WHERE UserAccountId = @UserAccountId
                    """,
                    new { UserAccountId = userAccountId },
                    transaction
                )
            );

            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    INSERT INTO dbo.UserCredential (UserAccountId, Hash)
                    VALUES (@UserAccountId, @Hash)
                    """,
                    new { UserAccountId = userAccountId, Hash = newPasswordHash },
                    transaction
                )
            );

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<UserAccount?> GetUserByIdAsync(Guid userAccountId)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<UserAccount>(
            """
            SELECT UserAccountID, Username, FirstName, LastName, Email, CreatedAt, UpdatedAt, DateOfBirth, RowVersion
            FROM dbo.UserAccount
            WHERE UserAccountID = @UserAccountId
            """,
            new { UserAccountId = userAccountId }
        );
    }

    /// <inheritdoc />
    /// <remarks>
    ///     Confirmation is recorded by inserting a row into <c>dbo.UserVerification</c>. If a concurrent
    ///     request verifies the same user first, the resulting duplicate-key SQL exception (error 2601/2627)
    ///     is swallowed to keep the operation idempotent.
    /// </remarks>
    /// <exception cref="Microsoft.Data.SqlClient.SqlException">
    ///     Thrown when the database command fails for a reason other than a duplicate verification record.
    /// </exception>
    public async Task<UserAccount?> ConfirmUserAccountAsync(Guid userAccountId)
    {
        UserAccount? user = await GetUserByIdAsync(userAccountId);
        if (user == null)
            return null;

        // Idempotency: if already verified, treat as successful confirmation.
        if (await IsUserVerifiedAsync(userAccountId))
            return user;

        await using DbConnection connection = await CreateConnection();

        try
        {
            await connection.ExecuteAsync(
                """
                INSERT INTO dbo.UserVerification (UserAccountId, VerificationDateTime)
                VALUES (@UserAccountId, GETDATE())
                """,
                new { UserAccountId = userAccountId }
            );
        }
        catch (SqlException ex) when (IsDuplicateVerificationViolation(ex))
        {
            // A concurrent request verified this user first. Keep behavior idempotent.
        }

        // Fetch and return the updated user
        return await GetUserByIdAsync(userAccountId);
    }

    /// <inheritdoc />
    public async Task<bool> IsUserVerifiedAsync(Guid userAccountId)
    {
        await using DbConnection connection = await CreateConnection();
        int? result = await connection.ExecuteScalarAsync<int?>(
            """
            SELECT TOP 1 1
            FROM dbo.UserVerification
            WHERE UserAccountID = @UserAccountId
            """,
            new { UserAccountId = userAccountId }
        );
        return result.HasValue;
    }

    /// <summary>Determines whether a <see cref="SqlException" /> is a duplicate key violation (SQL Server error 2601 or 2627).</summary>
    private static bool IsDuplicateVerificationViolation(SqlException ex)
    {
        // 2601/2627 are duplicate key violations in SQL Server.
        return ex.Number == 2601 || ex.Number == 2627;
    }
}
