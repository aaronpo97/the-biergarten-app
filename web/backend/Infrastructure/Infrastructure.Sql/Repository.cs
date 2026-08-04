using System.Data.Common;

namespace Infrastructure.Sql;

/// <summary>
///     Base class for ADO.NET-based repositories, providing shared connection creation and
///     entity-mapping infrastructure for derived repository implementations.
/// </summary>
public abstract class Repository<T>(ISqlConnectionFactory connectionFactory)
    where T : class
{
    /// <summary>
    ///     Creates and opens a new database connection using the configured <see cref="ISqlConnectionFactory" />.
    /// </summary>
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
    protected abstract T MapToEntity(DbDataReader reader);
}
