using System.Data.Common;
using Dapper;
using Infrastructure.Sql;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;

namespace Features.Auth.Identity;

/// <summary>
///     Dapper-based implementation of the ASP.NET Core Identity store interfaces consumed by
///     <see cref="UserManager{TUser}" />, persisting against the existing <c>dbo.UserAccount</c>,
///     <c>dbo.UserCredential</c>, and <c>dbo.UserVerification</c> tables. No EF Core is used, and no schema
///     changes were required: normalized name/email are computed on the fly rather than persisted (the
///     existing unique indexes are already case-insensitive under SQL Server's default collation).
/// </summary>
public sealed class DapperUserStore(ISqlConnectionFactory connectionFactory)
    : Repository<ApplicationUser>(connectionFactory),
        IUserStore<ApplicationUser>,
        IUserPasswordStore<ApplicationUser>,
        IUserEmailStore<ApplicationUser>
{
    private const string SelectUserSql = """
        SELECT UserAccountID AS Id, Username AS UserName, FirstName, LastName, Email, DateOfBirth
        FROM dbo.UserAccount
        """;

    /// <remarks>No unmanaged resources to release; each method opens and disposes its own connection.</remarks>
    public void Dispose() { }

    /// <inheritdoc />
    public Task<string> GetUserIdAsync(ApplicationUser user, CancellationToken cancellationToken) =>
        Task.FromResult(user.Id.ToString());

    /// <inheritdoc />
    public Task<string?> GetUserNameAsync(
        ApplicationUser user,
        CancellationToken cancellationToken
    ) => Task.FromResult<string?>(user.UserName);

    /// <inheritdoc />
    public Task SetUserNameAsync(
        ApplicationUser user,
        string? userName,
        CancellationToken cancellationToken
    )
    {
        user.UserName = userName ?? string.Empty;
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task<string?> GetNormalizedUserNameAsync(
        ApplicationUser user,
        CancellationToken cancellationToken
    ) => Task.FromResult(user.NormalizedUserName);

    /// <inheritdoc />
    public Task SetNormalizedUserNameAsync(
        ApplicationUser user,
        string? normalizedName,
        CancellationToken cancellationToken
    )
    {
        user.NormalizedUserName = normalizedName;
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    /// <remarks>
    ///     Inserts the account and its initial credential within a single database transaction, mirroring the
    ///     previous <c>AuthRepository.RegisterUserAsync</c> behavior. <see cref="UserManager{TUser}" /> already
    ///     checks username/email uniqueness before calling this method, so the duplicate-key branch here only
    ///     guards against a genuine race between two concurrent registrations.
    /// </remarks>
    public async Task<IdentityResult> CreateAsync(
        ApplicationUser user,
        CancellationToken cancellationToken
    )
    {
        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction = await connection.BeginTransactionAsync(
            cancellationToken
        );

        try
        {
            Guid userAccountId = await connection.ExecuteScalarAsync<Guid>(
                new CommandDefinition(
                    """
                    INSERT INTO dbo.UserAccount (Username, FirstName, LastName, DateOfBirth, Email)
                    OUTPUT INSERTED.UserAccountID
                    VALUES (@UserName, @FirstName, @LastName, @DateOfBirth, @Email);
                    """,
                    new
                    {
                        user.UserName,
                        user.FirstName,
                        user.LastName,
                        user.DateOfBirth,
                        user.Email,
                    },
                    transaction,
                    cancellationToken: cancellationToken
                )
            );

            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    INSERT INTO dbo.UserCredential (UserAccountId, Hash)
                    VALUES (@UserAccountId, @Hash);
                    """,
                    new { UserAccountId = userAccountId, Hash = user.PasswordHash },
                    transaction,
                    cancellationToken: cancellationToken
                )
            );

            await transaction.CommitAsync(cancellationToken);
            user.Id = userAccountId;
        }
        catch (SqlException ex) when (IsDuplicateKeyViolation(ex))
        {
            await transaction.RollbackAsync(cancellationToken);
            return IdentityResult.Failed(
                new IdentityError
                {
                    Code = "DuplicateUserName",
                    Description = "Username or email already exists.",
                }
            );
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        return IdentityResult.Success;
    }

    /// <inheritdoc />
    /// <remarks>
    ///     Persists profile field changes and keeps <c>dbo.UserVerification</c> in sync with
    ///     <see cref="ApplicationUser.EmailConfirmed" />: a row is inserted (idempotently, matching the
    ///     previous <c>AuthRepository.ConfirmUserAccountAsync</c> behavior) when
    ///     <see langword="true" />, and removed when <see langword="false" /> -- notably after
    ///     <see cref="UserManager{TUser}.SetEmailAsync" /> resets confirmation on an email change.
    /// </remarks>
    public async Task<IdentityResult> UpdateAsync(
        ApplicationUser user,
        CancellationToken cancellationToken
    )
    {
        await using DbConnection connection = await CreateConnection();

        await connection.ExecuteAsync(
            new CommandDefinition(
                """
                UPDATE dbo.UserAccount
                SET Username = @UserName, FirstName = @FirstName, LastName = @LastName,
                    Email = @Email, DateOfBirth = @DateOfBirth, UpdatedAt = GETDATE()
                WHERE UserAccountID = @Id
                """,
                new
                {
                    user.Id,
                    user.UserName,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.DateOfBirth,
                },
                cancellationToken: cancellationToken
            )
        );

        if (user.EmailConfirmed)
            await EnsureVerificationRowAsync(connection, user.Id, cancellationToken);
        else
            await RemoveVerificationRowAsync(connection, user.Id, cancellationToken);

        return IdentityResult.Success;
    }

    /// <inheritdoc />
    /// <remarks>
    ///     A plain <c>DELETE</c> against <c>dbo.UserAccount</c>: its foreign keys from
    ///     <c>dbo.UserCredential</c>, <c>dbo.UserVerification</c>, and <c>dbo.UserAvatar</c> cascade, so no
    ///     manual child cleanup is needed. Other tables (posts, comments, photos, follows) reference the
    ///     account with <c>ON DELETE NO ACTION</c> by design; deleting an account that still has any of
    ///     those fails with a foreign key violation, which is surfaced as a failed
    ///     <see cref="IdentityResult" /> rather than an unhandled <see cref="SqlException" />.
    /// </remarks>
    public async Task<IdentityResult> DeleteAsync(
        ApplicationUser user,
        CancellationToken cancellationToken
    )
    {
        await using DbConnection connection = await CreateConnection();

        try
        {
            await connection.ExecuteAsync(
                new CommandDefinition(
                    "DELETE FROM dbo.UserAccount WHERE UserAccountID = @Id",
                    new { user.Id },
                    cancellationToken: cancellationToken
                )
            );
        }
        catch (SqlException ex) when (IsForeignKeyViolation(ex))
        {
            return IdentityResult.Failed(
                new IdentityError
                {
                    Code = "AccountHasDependentRecords",
                    Description =
                        "Account cannot be deleted because other records still reference it.",
                }
            );
        }

        return IdentityResult.Success;
    }

    /// <inheritdoc />
    public async Task<ApplicationUser?> FindByIdAsync(
        string userId,
        CancellationToken cancellationToken
    )
    {
        if (!Guid.TryParse(userId, out Guid id))
            return null;

        await using DbConnection connection = await CreateConnection();
        ApplicationUser? user = await connection.QueryFirstOrDefaultAsync<ApplicationUser>(
            new CommandDefinition(
                $"{SelectUserSql} WHERE UserAccountID = @Id",
                new { Id = id },
                cancellationToken: cancellationToken
            )
        );

        if (user != null)
            await HydrateAsync(connection, user, cancellationToken);

        return user;
    }

    /// <inheritdoc />
    public async Task<ApplicationUser?> FindByNameAsync(
        string normalizedUserName,
        CancellationToken cancellationToken
    )
    {
        await using DbConnection connection = await CreateConnection();
        ApplicationUser? user = await connection.QueryFirstOrDefaultAsync<ApplicationUser>(
            new CommandDefinition(
                $"{SelectUserSql} WHERE Username = @UserName",
                new { UserName = normalizedUserName },
                cancellationToken: cancellationToken
            )
        );

        if (user != null)
            await HydrateAsync(connection, user, cancellationToken);

        return user;
    }

    /// <inheritdoc />
    /// <remarks>
    ///     For an existing account (<see cref="ApplicationUser.Id" /> already assigned), rotates the
    ///     credential transactionally -- revoking the previous <c>dbo.UserCredential</c> row(s) and inserting
    ///     the new hash -- mirroring the previous <c>AuthRepository.RotateCredentialAsync</c> behavior. During
    ///     registration <see cref="UserManager{TUser}" /> calls this before the account has an ID (i.e. before
    ///     <see cref="CreateAsync" /> runs); in that case only the in-memory hash is set, and
    ///     <see cref="CreateAsync" /> writes the initial credential itself as part of its own transaction.
    /// </remarks>
    public async Task SetPasswordHashAsync(
        ApplicationUser user,
        string? passwordHash,
        CancellationToken cancellationToken
    )
    {
        string? previousHash = user.PasswordHash;
        user.PasswordHash = passwordHash;

        if (user.Id == Guid.Empty || passwordHash == null || passwordHash == previousHash)
            return;

        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction = await connection.BeginTransactionAsync(
            cancellationToken
        );

        try
        {
            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    UPDATE dbo.UserCredential
                    SET IsRevoked = 1, RevokedAt = GETDATE()
                    WHERE UserAccountId = @UserAccountId AND IsRevoked = 0
                    """,
                    new { UserAccountId = user.Id },
                    transaction,
                    cancellationToken: cancellationToken
                )
            );

            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    INSERT INTO dbo.UserCredential (UserAccountId, Hash)
                    VALUES (@UserAccountId, @Hash);
                    """,
                    new { UserAccountId = user.Id, Hash = passwordHash },
                    transaction,
                    cancellationToken: cancellationToken
                )
            );

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    /// <inheritdoc />
    public Task<string?> GetPasswordHashAsync(
        ApplicationUser user,
        CancellationToken cancellationToken
    ) => Task.FromResult(user.PasswordHash);

    /// <inheritdoc />
    public Task<bool> HasPasswordAsync(ApplicationUser user, CancellationToken cancellationToken) =>
        Task.FromResult(user.PasswordHash != null);

    /// <inheritdoc />
    public Task SetEmailAsync(
        ApplicationUser user,
        string? email,
        CancellationToken cancellationToken
    )
    {
        user.Email = email ?? string.Empty;
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task<string?> GetEmailAsync(ApplicationUser user, CancellationToken cancellationToken) =>
        Task.FromResult<string?>(user.Email);

    /// <inheritdoc />
    public Task<bool> GetEmailConfirmedAsync(
        ApplicationUser user,
        CancellationToken cancellationToken
    ) => Task.FromResult(user.EmailConfirmed);

    /// <inheritdoc />
    public Task SetEmailConfirmedAsync(
        ApplicationUser user,
        bool confirmed,
        CancellationToken cancellationToken
    )
    {
        user.EmailConfirmed = confirmed;
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public async Task<ApplicationUser?> FindByEmailAsync(
        string normalizedEmail,
        CancellationToken cancellationToken
    )
    {
        await using DbConnection connection = await CreateConnection();
        ApplicationUser? user = await connection.QueryFirstOrDefaultAsync<ApplicationUser>(
            new CommandDefinition(
                $"{SelectUserSql} WHERE Email = @Email",
                new { Email = normalizedEmail },
                cancellationToken: cancellationToken
            )
        );

        if (user != null)
            await HydrateAsync(connection, user, cancellationToken);

        return user;
    }

    /// <inheritdoc />
    public Task<string?> GetNormalizedEmailAsync(
        ApplicationUser user,
        CancellationToken cancellationToken
    ) => Task.FromResult(user.NormalizedEmail);

    /// <inheritdoc />
    public Task SetNormalizedEmailAsync(
        ApplicationUser user,
        string? normalizedEmail,
        CancellationToken cancellationToken
    )
    {
        user.NormalizedEmail = normalizedEmail;
        return Task.CompletedTask;
    }

    /// <summary>Loads the active credential hash and verification status onto a freshly queried user.</summary>
    private static async Task HydrateAsync(
        DbConnection connection,
        ApplicationUser user,
        CancellationToken cancellationToken
    )
    {
        user.PasswordHash = await connection.ExecuteScalarAsync<string?>(
            new CommandDefinition(
                """
                SELECT Hash
                FROM dbo.UserCredential
                WHERE UserAccountId = @UserAccountId AND IsRevoked = 0
                """,
                new { UserAccountId = user.Id },
                cancellationToken: cancellationToken
            )
        );

        int? verified = await connection.ExecuteScalarAsync<int?>(
            new CommandDefinition(
                """
                SELECT TOP 1 1
                FROM dbo.UserVerification
                WHERE UserAccountID = @UserAccountId
                """,
                new { UserAccountId = user.Id },
                cancellationToken: cancellationToken
            )
        );
        user.EmailConfirmed = verified.HasValue;
    }

    /// <remarks>
    ///     If a concurrent request verifies the same user first, the resulting duplicate-key SQL exception
    ///     (error 2601/2627) is swallowed to keep the operation idempotent.
    /// </remarks>
    private static async Task EnsureVerificationRowAsync(
        DbConnection connection,
        Guid userAccountId,
        CancellationToken cancellationToken
    )
    {
        int? alreadyVerified = await connection.ExecuteScalarAsync<int?>(
            new CommandDefinition(
                """
                SELECT TOP 1 1
                FROM dbo.UserVerification
                WHERE UserAccountID = @UserAccountId
                """,
                new { UserAccountId = userAccountId },
                cancellationToken: cancellationToken
            )
        );

        if (alreadyVerified.HasValue)
            return;

        try
        {
            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    INSERT INTO dbo.UserVerification (UserAccountId, VerificationDateTime)
                    VALUES (@UserAccountId, GETDATE())
                    """,
                    new { UserAccountId = userAccountId },
                    cancellationToken: cancellationToken
                )
            );
        }
        catch (SqlException ex) when (IsDuplicateKeyViolation(ex))
        {
            // A concurrent request verified this user first. Keep behavior idempotent.
        }
    }

    /// <summary>Removes the <c>dbo.UserVerification</c> row for a user, if one exists.</summary>
    private static Task RemoveVerificationRowAsync(
        DbConnection connection,
        Guid userAccountId,
        CancellationToken cancellationToken
    ) =>
        connection.ExecuteAsync(
            new CommandDefinition(
                "DELETE FROM dbo.UserVerification WHERE UserAccountID = @UserAccountId",
                new { UserAccountId = userAccountId },
                cancellationToken: cancellationToken
            )
        );

    /// <summary>Determines whether a <see cref="SqlException" /> is a duplicate key violation (SQL Server error 2601 or 2627).</summary>
    private static bool IsDuplicateKeyViolation(SqlException ex) => ex.Number is 2601 or 2627;

    /// <summary>Determines whether a <see cref="SqlException" /> is a foreign key constraint violation (SQL Server error 547).</summary>
    private static bool IsForeignKeyViolation(SqlException ex) => ex.Number == 547;
}
