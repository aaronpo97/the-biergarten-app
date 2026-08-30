using System.Data.Common;

namespace Database.Connection;

/// <summary>
///     Base class for Dapper-based repositories, providing shared connection creation for derived
///     repository implementations.
/// </summary>
public abstract class DapperRepository(ISqlConnectionFactory connectionFactory)
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
    ///     Rolls back <paramref name="transaction" />, swallowing any exception the rollback itself
    ///     raises (for example when the provider has already completed the transaction after a
    ///     connection failure) so the exception that triggered the rollback is what propagates.
    /// </summary>
    protected static async Task RollbackQuietlyAsync(DbTransaction transaction)
    {
        try
        {
            await transaction.RollbackAsync();
        }
        catch
        {
            // Ignore: the original exception (rethrown by the caller) is what matters here.
        }
    }
}
