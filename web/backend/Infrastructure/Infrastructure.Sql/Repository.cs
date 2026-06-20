using System.Data.Common;

namespace Infrastructure.Sql;

/// <summary>
///     Base class for ADO.NET-based repositories, providing shared connection creation and
///     entity-mapping infrastructure for derived repository implementations.
/// </summary>
/// <typeparam name="T">The entity type managed by the repository.</typeparam>
/// <param name="connectionFactory">The factory used to create database connections.</param>
public abstract class Repository<T>(ISqlConnectionFactory connectionFactory)
    where T : class
{
    /// <summary>
    ///     Creates and opens a new database connection using the configured <see cref="ISqlConnectionFactory" />.
    /// </summary>
    /// <returns>An open <see cref="DbConnection" /> ready for use.</returns>
    /// <exception cref="DbException">Thrown when the connection cannot be opened.</exception>
    protected async Task<DbConnection> CreateConnection()
    {
        DbConnection connection = connectionFactory.CreateConnection();
        await connection.OpenAsync();
        return connection;
    }

    /// <summary>
    ///     Maps the current row of a data reader to an instance of <typeparamref name="T" />.
    /// </summary>
    /// <param name="reader">The data reader positioned on the row to map.</param>
    /// <returns>The mapped entity instance.</returns>
    protected abstract T MapToEntity(DbDataReader reader);
}