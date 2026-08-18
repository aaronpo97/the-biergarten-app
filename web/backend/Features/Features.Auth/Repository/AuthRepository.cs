using System.Data.Common;
using Dapper;
using Domain.Entities;
using Domain.Exceptions;
using Features.Auth.Dtos;
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
    private const string SelectColumns =
        "UserAccountID, Username, FirstName, LastName, Email, CreatedAt, UpdatedAt, DateOfBirth, Timer";

    /// <summary>
    ///     Registers a new user account and its initial credential in a single transaction, then fetches
    ///     and returns the newly created user.
    /// </summary>
    /// <exception cref="Exception">Thrown when the newly registered user cannot be retrieved after registration.</exception>
    public async Task<UserAccount> RegisterUserAsync(UserRegistrationDto userRegistrationDto)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction = await connection.BeginTransactionAsync();

        var (username, firstName, lastName, email, dateOfBirth, passwordHash) = userRegistrationDto;
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
                    new { username, firstName, lastName, dateOfBirth, email },
                    transaction
                )
            );

            int credentialRows = await connection.ExecuteAsync(
                new CommandDefinition(
                    "INSERT INTO dbo.UserCredential (UserAccountId, Hash) VALUES (@UserAccountId, @Hash);",
                    new { UserAccountId = userAccountId, Hash = passwordHash },
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

        return await GetUserByIdAsync(userAccountId)
            ?? throw new Exception("Failed to retrieve newly registered user.");
    }

    /// <summary>Retrieves a user account by email.</summary>
    public async Task<UserAccount?> GetUserByEmailAsync(string email)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<UserAccount>(
            $"SELECT {SelectColumns} FROM dbo.UserAccount WHERE Email = @Email",
            new { Email = email }
        );
    }

    /// <summary>Retrieves a user account by username.</summary>
    public async Task<UserAccount?> GetUserByUsernameAsync(string username)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<UserAccount>(
            $"SELECT {SelectColumns} FROM dbo.UserAccount WHERE Username = @Username",
            new { Username = username }
        );
    }

    /// <summary>Retrieves the active (non-revoked) credential for a user account.</summary>
    public async Task<UserCredential?> GetActiveCredentialByUserAccountIdAsync(Guid userAccountId)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<UserCredential>(
            """
            SELECT UserCredentialId, UserAccountId, Hash, CreatedAt, Timer
            FROM dbo.UserCredential
            WHERE UserAccountId = @UserAccountId AND IsRevoked = 0
            """,
            new { UserAccountId = userAccountId }
        );
    }

    /// <summary>
    ///     Rotates a user's credential by revoking all existing credentials and creating a new one.
    /// </summary>
    /// <exception cref="NotFoundException">Thrown when no account with <paramref name="userAccountId" /> exists.</exception>
    public async Task RotateCredentialAsync(Guid userAccountId, string newPasswordHash)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction = await connection.BeginTransactionAsync();

        try
        {
            bool exists =
                await connection.ExecuteScalarAsync<int?>(
                    new CommandDefinition(
                        "SELECT 1 FROM dbo.UserAccount WHERE UserAccountID = @UserAccountId",
                        new { UserAccountId = userAccountId },
                        transaction
                    )
                ) is not null;

            if (!exists)
                throw new NotFoundException("User account not found.");

            await connection.ExecuteAsync(
                new CommandDefinition(
                    "UPDATE dbo.UserCredential SET IsRevoked = 1, RevokedAt = GETDATE() WHERE UserAccountId = @UserAccountId",
                    new { UserAccountId = userAccountId },
                    transaction
                )
            );

            await connection.ExecuteAsync(
                new CommandDefinition(
                    "INSERT INTO dbo.UserCredential (UserAccountId, Hash) VALUES (@UserAccountId, @Hash)",
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

    /// <summary>Retrieves a user account by ID.</summary>
    public async Task<UserAccount?> GetUserByIdAsync(Guid userAccountId)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<UserAccount>(
            $"SELECT {SelectColumns} FROM dbo.UserAccount WHERE UserAccountID = @UserAccountId",
            new { UserAccountId = userAccountId }
        );
    }

    /// <summary>
    ///     Marks a user account as confirmed by inserting a verification record. If the user is already
    ///     verified, this is a no-op and the existing user is returned (idempotent). If a concurrent request
    ///     verifies the user first, the resulting duplicate-key SQL exception (error 2601/2627) is swallowed.
    /// </summary>
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
                "INSERT INTO dbo.UserVerification (UserAccountId, VerificationDateTime) VALUES (@UserAccountId, GETDATE())",
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

    /// <summary>Checks whether a user account has been verified by querying the <c>dbo.UserVerification</c> table.</summary>
    public async Task<bool> IsUserVerifiedAsync(Guid userAccountId)
    {
        await using DbConnection connection = await CreateConnection();
        int? result = await connection.ExecuteScalarAsync<int?>(
            "SELECT TOP 1 1 FROM dbo.UserVerification WHERE UserAccountID = @UserAccountId",
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
