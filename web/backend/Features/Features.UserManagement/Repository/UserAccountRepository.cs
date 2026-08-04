using System.Data;
using System.Data.Common;
using Domain.Entities;
using Infrastructure.Sql;

namespace Features.UserManagement.Repository;

/// <summary>
///     ADO.NET-based implementation of <see cref="IUserAccountRepository" /> backed by SQL Server
///     stored procedures.
/// </summary>
public class UserAccountRepository(ISqlConnectionFactory connectionFactory)
    : Repository<UserAccount>(connectionFactory),
        IUserAccountRepository
{
    /// <summary>Uses the <c>usp_GetUserAccountById</c> stored procedure.</summary>
    /// <inheritdoc />
    public async Task<UserAccount?> GetByIdAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "usp_GetUserAccountById";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@UserAccountId", id);

        await using DbDataReader reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToEntity(reader) : null;
    }

    /// <summary>
    ///     Uses the <c>usp_GetAllUserAccounts</c> stored procedure. The <c>@Limit</c> and <c>@Offset</c>
    ///     parameters are only added when their corresponding argument has a value.
    /// </summary>
    /// <inheritdoc />
    public async Task<IEnumerable<UserAccount>> GetAllAsync(int? limit, int? offset)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "usp_GetAllUserAccounts";
        command.CommandType = CommandType.StoredProcedure;

        if (limit.HasValue)
            AddParameter(command, "@Limit", limit.Value);

        if (offset.HasValue)
            AddParameter(command, "@Offset", offset.Value);

        await using DbDataReader reader = await command.ExecuteReaderAsync();
        List<UserAccount> users = new();

        while (await reader.ReadAsync())
            users.Add(MapToEntity(reader));

        return users;
    }

    /// <summary>
    ///     Updates a user account's username, first name, last name, email, and date of birth using
    ///     the <c>usp_UpdateUserAccount</c> stored procedure.
    /// </summary>
    /// <inheritdoc />
    public async Task UpdateAsync(UserAccount userAccount)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "usp_UpdateUserAccount";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@UserAccountId", userAccount.UserAccountId);
        AddParameter(command, "@Username", userAccount.Username);
        AddParameter(command, "@FirstName", userAccount.FirstName);
        AddParameter(command, "@LastName", userAccount.LastName);
        AddParameter(command, "@Email", userAccount.Email);
        AddParameter(command, "@DateOfBirth", userAccount.DateOfBirth);

        await command.ExecuteNonQueryAsync();
    }

    /// <summary>Uses the <c>usp_DeleteUserAccount</c> stored procedure.</summary>
    /// <inheritdoc />
    public async Task DeleteAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "usp_DeleteUserAccount";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@UserAccountId", id);
        await command.ExecuteNonQueryAsync();
    }

    /// <summary>Uses the <c>usp_GetUserAccountByUsername</c> stored procedure.</summary>
    /// <inheritdoc />
    public async Task<UserAccount?> GetByUsernameAsync(string username)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "usp_GetUserAccountByUsername";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@Username", username);

        await using DbDataReader reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToEntity(reader) : null;
    }

    /// <summary>Uses the <c>usp_GetUserAccountByEmail</c> stored procedure.</summary>
    /// <inheritdoc />
    public async Task<UserAccount?> GetByEmailAsync(string email)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "usp_GetUserAccountByEmail";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@Email", email);

        await using DbDataReader reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToEntity(reader) : null;
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

    /// <summary>Converts <c>null</c> values to <see cref="DBNull.Value" /> when adding the parameter.</summary>
    private static void AddParameter(DbCommand command, string name, object? value)
    {
        DbParameter p = command.CreateParameter();
        p.ParameterName = name;
        p.Value = value ?? DBNull.Value;
        command.Parameters.Add(p);
    }
}
