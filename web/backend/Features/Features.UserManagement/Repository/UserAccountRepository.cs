using System.Data;
using System.Data.Common;
using Domain.Entities;
using Infrastructure.Sql;

namespace Features.UserManagement.Repository;

/// <summary>
///     ADO.NET-based implementation of <see cref="IUserAccountRepository" /> backed by SQL Server
///     stored procedures.
/// </summary>
/// <param name="connectionFactory">The factory used to create database connections.</param>
public class UserAccountRepository(ISqlConnectionFactory connectionFactory)
    : Repository<UserAccount>(connectionFactory),
        IUserAccountRepository
{
    /// <summary>
    ///     Retrieves a user account by ID using the <c>usp_GetUserAccountById</c> stored procedure.
    /// </summary>
    /// <param name="id">The unique identifier of the user account.</param>
    /// <returns>The matching <see cref="Domain.Entities.UserAccount" />, or <c>null</c> if not found.</returns>
    /// <exception cref="Microsoft.Data.SqlClient.SqlException">Thrown when the database command fails.</exception>
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
    ///     Retrieves all user accounts, optionally paginated, using the <c>usp_GetAllUserAccounts</c>
    ///     stored procedure. The <c>@Limit</c> and <c>@Offset</c> parameters are only added when their
    ///     corresponding argument has a value.
    /// </summary>
    /// <param name="limit">The maximum number of records to return, or <c>null</c> for no limit.</param>
    /// <param name="offset">The number of records to skip, or <c>null</c> for no offset.</param>
    /// <returns>The collection of matching <see cref="Domain.Entities.UserAccount" /> records.</returns>
    /// <exception cref="Microsoft.Data.SqlClient.SqlException">Thrown when the database command fails.</exception>
    public async Task<IEnumerable<UserAccount>> GetAllAsync(
        int? limit,
        int? offset
    )
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

        while (await reader.ReadAsync()) users.Add(MapToEntity(reader));

        return users;
    }

    /// <summary>
    ///     Updates a user account's username, first name, last name, email, and date of birth using
    ///     the <c>usp_UpdateUserAccount</c> stored procedure.
    /// </summary>
    /// <param name="userAccount">The user account containing updated values. Must have a valid <c>UserAccountId</c>.</param>
    /// <exception cref="Microsoft.Data.SqlClient.SqlException">Thrown when the database command fails.</exception>
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

    /// <summary>
    ///     Deletes a user account by ID using the <c>usp_DeleteUserAccount</c> stored procedure.
    /// </summary>
    /// <param name="id">The unique identifier of the user account to delete.</param>
    /// <exception cref="Microsoft.Data.SqlClient.SqlException">Thrown when the database command fails.</exception>
    public async Task DeleteAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "usp_DeleteUserAccount";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@UserAccountId", id);
        await command.ExecuteNonQueryAsync();
    }

    /// <summary>
    ///     Retrieves a user account by username using the <c>usp_GetUserAccountByUsername</c> stored procedure.
    /// </summary>
    /// <param name="username">The username to search for.</param>
    /// <returns>The matching <see cref="Domain.Entities.UserAccount" />, or <c>null</c> if not found.</returns>
    /// <exception cref="Microsoft.Data.SqlClient.SqlException">Thrown when the database command fails.</exception>
    public async Task<UserAccount?> GetByUsernameAsync(
        string username
    )
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
    ///     Retrieves a user account by email address using the <c>usp_GetUserAccountByEmail</c> stored procedure.
    /// </summary>
    /// <param name="email">The email address to search for.</param>
    /// <returns>The matching <see cref="Domain.Entities.UserAccount" />, or <c>null</c> if not found.</returns>
    /// <exception cref="Microsoft.Data.SqlClient.SqlException">Thrown when the database command fails.</exception>
    public async Task<UserAccount?> GetByEmailAsync(
        string email
    )
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "usp_GetUserAccountByEmail";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@Email", email);

        await using DbDataReader reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToEntity(reader) : null;
    }

    /// <summary>
    ///     Maps the current row of a data reader to a <see cref="Domain.Entities.UserAccount" /> entity.
    /// </summary>
    /// <param name="reader">The data reader positioned on the row to map.</param>
    /// <returns>The mapped <see cref="Domain.Entities.UserAccount" /> instance.</returns>
    protected override UserAccount MapToEntity(
        DbDataReader reader
    )
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
            Timer = reader.IsDBNull(reader.GetOrdinal("Timer"))
                ? null
                : (byte[])reader["Timer"]
        };
    }

    /// <summary>
    ///     Helper method to add a parameter to a database command, converting <c>null</c> values to
    ///     <see cref="DBNull.Value" />.
    /// </summary>
    /// <param name="command">The command to add the parameter to.</param>
    /// <param name="name">The parameter name (including any prefix, e.g. "@Username").</param>
    /// <param name="value">The parameter value, or <c>null</c> to bind <see cref="DBNull.Value" />.</param>
    private static void AddParameter(
        DbCommand command,
        string name,
        object? value
    )
    {
        DbParameter p = command.CreateParameter();
        p.ParameterName = name;
        p.Value = value ?? DBNull.Value;
        command.Parameters.Add(p);
    }
}