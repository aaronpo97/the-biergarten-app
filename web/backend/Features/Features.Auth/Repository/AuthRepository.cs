using System.Data;
using System.Data.Common;
using Domain.Entities;
using Features.Auth.Dtos;
using Infrastructure.Sql;
using Microsoft.Data.SqlClient;

namespace Features.Auth.Repository;

/// <summary>
///     ADO.NET-based implementation of <see cref="IAuthRepository" /> backed by SQL Server stored procedures,
///     handling user registration, credential lookup/rotation, and account verification.
/// </summary>
public class AuthRepository(ISqlConnectionFactory connectionFactory)
    : Repository<UserAccount>(connectionFactory),
        IAuthRepository
{
    /// <summary>
    ///     Registers a new user account and initial credential using the <c>USP_RegisterUser</c> stored
    ///     procedure, then fetches and returns the newly created user.
    /// </summary>
    /// <remarks>
    ///     The stored procedure's scalar result (expected to be the new user's ID) is parsed defensively:
    ///     it may be returned as a <see cref="Guid" />, a parseable <see cref="string" />, or a 16-byte array.
    ///     If the result cannot be interpreted, <see cref="Guid.Empty" /> is used, which will cause the
    ///     subsequent lookup to fail.
    /// </remarks>
    /// <exception cref="Exception">Thrown when the newly registered user cannot be retrieved after registration.</exception>
    public async Task<UserAccount> RegisterUserAsync(UserRegistrationDto userRegistrationDto)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();

        command.CommandText = "USP_RegisterUser";
        command.CommandType = CommandType.StoredProcedure;

        var (username, firstName, lastName, email, dateOfBirth, passwordHash) = userRegistrationDto;

        AddParameter(command, "@Username", username);
        AddParameter(command, "@FirstName", firstName);
        AddParameter(command, "@LastName", lastName);
        AddParameter(command, "@Email", email);
        AddParameter(command, "@DateOfBirth", dateOfBirth);
        AddParameter(command, "@Hash", passwordHash);

        object? result = await command.ExecuteScalarAsync();

        Guid userAccountId = Guid.Empty;
        if (result != null && result != DBNull.Value)
        {
            if (result is Guid g)
                userAccountId = g;
            else if (result is string s && Guid.TryParse(s, out Guid parsed))
                userAccountId = parsed;
            else if (result is byte[] bytes && bytes.Length == 16)
                userAccountId = new Guid(bytes);
            else
                // Fallback: try to convert and parse string representation
                try
                {
                    string? str = result.ToString();
                    if (!string.IsNullOrEmpty(str) && Guid.TryParse(str, out Guid p))
                        userAccountId = p;
                }
                catch
                {
                    userAccountId = Guid.Empty;
                }
        }

        return await GetUserByIdAsync(userAccountId)
            ?? throw new Exception("Failed to retrieve newly registered user.");
    }

    /// <summary>Retrieves a user account by email using the <c>usp_GetUserAccountByEmail</c> stored procedure.</summary>
    public async Task<UserAccount?> GetUserByEmailAsync(string email)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "usp_GetUserAccountByEmail";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@Email", email);

        await using DbDataReader reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToEntity(reader) : null;
    }

    /// <summary>Retrieves a user account by username using the <c>usp_GetUserAccountByUsername</c> stored procedure.</summary>
    public async Task<UserAccount?> GetUserByUsernameAsync(string username)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "usp_GetUserAccountByUsername";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@Username", username);

        await using DbDataReader reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToEntity(reader) : null;
    }

    /// <summary>
    ///     Retrieves the active (non-revoked) credential for a user account using the
    ///     <c>USP_GetActiveUserCredentialByUserAccountId</c> stored procedure.
    /// </summary>
    public async Task<UserCredential?> GetActiveCredentialByUserAccountIdAsync(Guid userAccountId)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "USP_GetActiveUserCredentialByUserAccountId";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@UserAccountId", userAccountId);

        await using DbDataReader reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToCredentialEntity(reader) : null;
    }

    /// <summary>
    ///     Rotates a user's credential by invalidating all existing credentials and creating a new one,
    ///     using the <c>USP_RotateUserCredential</c> stored procedure.
    /// </summary>
    public async Task RotateCredentialAsync(Guid userAccountId, string newPasswordHash)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "USP_RotateUserCredential";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@UserAccountId_", userAccountId);
        AddParameter(command, "@Hash", newPasswordHash);

        await command.ExecuteNonQueryAsync();
    }

    /// <summary>Retrieves a user account by ID using the <c>usp_GetUserAccountById</c> stored procedure.</summary>
    public async Task<UserAccount?> GetUserByIdAsync(Guid userAccountId)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "usp_GetUserAccountById";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@UserAccountId", userAccountId);

        await using DbDataReader reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToEntity(reader) : null;
    }

    /// <summary>
    ///     Marks a user account as confirmed by creating a verification record via the
    ///     <c>USP_CreateUserVerification</c> stored procedure. If the user is already verified, this is a
    ///     no-op and the existing user is returned (idempotent). If a concurrent request verifies the user
    ///     first, the resulting duplicate-key SQL exception (error 2601/2627) is swallowed.
    /// </summary>
    /// <exception cref="Microsoft.Data.SqlClient.SqlException">
    ///     Thrown when the database command fails for a reason other than
    ///     a duplicate verification record.
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
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "USP_CreateUserVerification";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@UserAccountID_", userAccountId);

        try
        {
            await command.ExecuteNonQueryAsync();
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
        await using DbCommand command = connection.CreateCommand();
        command.CommandText =
            "SELECT TOP 1 1 FROM dbo.UserVerification WHERE UserAccountID = @UserAccountID";
        command.CommandType = CommandType.Text;

        AddParameter(command, "@UserAccountID", userAccountId);

        object? result = await command.ExecuteScalarAsync();
        return result != null && result != DBNull.Value;
    }

    /// <summary>Determines whether a <see cref="SqlException" /> is a duplicate key violation (SQL Server error 2601 or 2627).</summary>
    private static bool IsDuplicateVerificationViolation(SqlException ex)
    {
        // 2601/2627 are duplicate key violations in SQL Server.
        return ex.Number == 2601 || ex.Number == 2627;
    }

    protected override UserAccount MapToEntity(DbDataReader reader)
    {
        return new UserAccount
        {
            UserAccountId = reader.GetGuid(reader.GetOrdinal("UserAccountId")),
            Username = reader.GetString(reader.GetOrdinal("Username")),
            FirstName = reader.GetString(reader.GetOrdinal("FirstName")),
            LastName = reader.GetString(reader.GetOrdinal("LastName")),
            Email = reader.GetString(reader.GetOrdinal("Email")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
            UpdatedAt = reader.IsDBNull(reader.GetOrdinal("UpdatedAt"))
                ? null
                : reader.GetDateTime(reader.GetOrdinal("UpdatedAt")),
            DateOfBirth = reader.GetDateTime(reader.GetOrdinal("DateOfBirth")),
            Timer = reader.IsDBNull(reader.GetOrdinal("Timer")) ? null : (byte[])reader["Timer"],
        };
    }

    /// <summary>
    ///     Maps a data reader row to a UserCredential entity. The <c>Timer</c> column is mapped only if
    ///     present in the reader's schema, allowing this method to support result sets that omit it.
    /// </summary>
    private static UserCredential MapToCredentialEntity(DbDataReader reader)
    {
        UserCredential entity = new()
        {
            UserCredentialId = reader.GetGuid(reader.GetOrdinal("UserCredentialId")),
            UserAccountId = reader.GetGuid(reader.GetOrdinal("UserAccountId")),
            Hash = reader.GetString(reader.GetOrdinal("Hash")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
        };

        // Optional columns
        bool hasTimer =
            reader
                .GetSchemaTable()
                ?.Rows.Cast<DataRow>()
                .Any(r =>
                    string.Equals(
                        r["ColumnName"]?.ToString(),
                        "Timer",
                        StringComparison.OrdinalIgnoreCase
                    )
                )
            ?? false;

        if (hasTimer)
            entity.Timer = reader.IsDBNull(reader.GetOrdinal("Timer"))
                ? null
                : (byte[])reader["Timer"];

        return entity;
    }

    /// <summary>Adds a parameter to a database command, converting <c>null</c> values to <see cref="DBNull.Value" />.</summary>
    private static void AddParameter(DbCommand command, string name, object? value)
    {
        DbParameter p = command.CreateParameter();
        p.ParameterName = name;
        p.Value = value ?? DBNull.Value;
        command.Parameters.Add(p);
    }
}
