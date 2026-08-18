using System.Data.Common;

namespace Infrastructure.Sql;

/// <summary>
///     Base class for Dapper-based repositories, providing shared connection creation for derived
///     repository implementations.
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
}
