using System.Data;
using System.Data.Common;
using Domain.Entities;
using Infrastructure.Repository.Sql;
using Microsoft.Data.SqlClient;

namespace Infrastructure.Repository.Auth;

public class AuthRepository(ISqlConnectionFactory connectionFactory)
    : Repository<Domain.Entities.UserAccount>(connectionFactory),
        IAuthRepository
{
    public async Task<Domain.Entities.UserAccount> RegisterUserAsync(
        string username,
        string firstName,
        string lastName,
        string email,
        DateTime dateOfBirth,
        string passwordHash
    )
    {
        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();

        command.CommandText = "USP_RegisterUser";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@Username", username);
        AddParameter(command, "@FirstName", firstName);
        AddParameter(command, "@LastName", lastName);
        AddParameter(command, "@Email", email);
        AddParameter(command, "@DateOfBirth", dateOfBirth);
        AddParameter(command, "@Hash", passwordHash);

        var result = await command.ExecuteScalarAsync();

        Guid userAccountId = Guid.Empty;
        if (result != null && result != DBNull.Value)
        {
            if (result is Guid g)
            {
                userAccountId = g;
            }
            else if (result is string s && Guid.TryParse(s, out var parsed))
            {
                userAccountId = parsed;
            }
            else if (result is byte[] bytes && bytes.Length == 16)
            {
                userAccountId = new Guid(bytes);
            }
            else
            {
                // Fallback: try to convert and parse string representation
                try
                {
                    var str = result.ToString();
                    if (!string.IsNullOrEmpty(str) && Guid.TryParse(str, out var p))
                        userAccountId = p;
                }
                catch
                {
                    userAccountId = Guid.Empty;
                }
            }
        }

        return await GetUserByIdAsync(userAccountId) ?? throw new Exception("Failed to retrieve newly registered user.");
    }

    public async Task<Domain.Entities.UserAccount?> GetUserByEmailAsync(
        string email
    )
    {
        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "usp_GetUserAccountByEmail";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@Email", email);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToEntity(reader) : null;
    }

    public async Task<Domain.Entities.UserAccount?> GetUserByUsernameAsync(
        string username
    )
    {
        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "usp_GetUserAccountByUsername";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@Username", username);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToEntity(reader) : null;
    }

    public async Task<UserCredential?> GetActiveCredentialByUserAccountIdAsync(
        Guid userAccountId
    )
    {
        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "USP_GetActiveUserCredentialByUserAccountId";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@UserAccountId", userAccountId);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToCredentialEntity(reader) : null;
    }

    public async Task RotateCredentialAsync(
        Guid userAccountId,
        string newPasswordHash
    )
    {
        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "USP_RotateUserCredential";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@UserAccountId_", userAccountId);
        AddParameter(command, "@Hash", newPasswordHash);

        await command.ExecuteNonQueryAsync();
    }

    public async Task<Domain.Entities.UserAccount?> GetUserByIdAsync(
        Guid userAccountId
    )
    {
        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "usp_GetUserAccountById";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@UserAccountId", userAccountId);

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToEntity(reader) : null;
    }

    public async Task<Domain.Entities.UserAccount?> ConfirmUserAccountAsync(
        Guid userAccountId
    )
    {
        var user = await GetUserByIdAsync(userAccountId);
        if (user == null)
        {
            return null;
        }

        // Idempotency: if already verified, treat as successful confirmation.
        if (await IsUserVerifiedAsync(userAccountId))
        {
            return user;
        }

        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();
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

    public async Task<bool> IsUserVerifiedAsync(Guid userAccountId)
    {
        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();
        command.CommandText =
            "SELECT TOP 1 1 FROM dbo.UserVerification WHERE UserAccountID = @UserAccountID";
        command.CommandType = CommandType.Text;

        AddParameter(command, "@UserAccountID", userAccountId);

        var result = await command.ExecuteScalarAsync();
        return result != null && result != DBNull.Value;
    }

    private static bool IsDuplicateVerificationViolation(SqlException ex)
    {
        // 2601/2627 are duplicate key violations in SQL Server.
        return ex.Number == 2601 || ex.Number == 2627;
    }


    /// <summary>
    /// Maps a data reader row to a UserAccount entity.
    /// </summary>
    protected override Domain.Entities.UserAccount MapToEntity(
        DbDataReader reader
    )
    {
        return new Domain.Entities.UserAccount
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
            Timer = reader.IsDBNull(reader.GetOrdinal("Timer"))
                ? null
                : (byte[])reader["Timer"],
        };
    }

    /// <summary>
    /// Maps a data reader row to a UserCredential entity.
    /// </summary>
    private static UserCredential MapToCredentialEntity(DbDataReader reader)
    {
        var entity = new UserCredential
        {
            UserCredentialId = reader.GetGuid(
                reader.GetOrdinal("UserCredentialId")
            ),
            UserAccountId = reader.GetGuid(reader.GetOrdinal("UserAccountId")),
            Hash = reader.GetString(reader.GetOrdinal("Hash")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
        };

        // Optional columns
        var hasTimer =
            reader
                .GetSchemaTable()
                ?.Rows.Cast<System.Data.DataRow>()
                .Any(r =>
                    string.Equals(
                        r["ColumnName"]?.ToString(),
                        "Timer",
                        StringComparison.OrdinalIgnoreCase
                    )
                ) ?? false;

        if (hasTimer)
        {
            entity.Timer = reader.IsDBNull(reader.GetOrdinal("Timer"))
                ? null
                : (byte[])reader["Timer"];
        }

        return entity;
    }

    /// <summary>
    /// Helper method to add a parameter to a database command.
    /// </summary>
    private static void AddParameter(
        DbCommand command,
        string name,
        object? value
    )
    {
        var p = command.CreateParameter();
        p.ParameterName = name;
        p.Value = value ?? DBNull.Value;
        command.Parameters.Add(p);
    }
}
