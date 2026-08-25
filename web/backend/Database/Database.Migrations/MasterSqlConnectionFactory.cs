using Database.Connection;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Database.Migrations;

/// <summary>
///     <see cref="ISqlConnectionFactory" /> implementation that connects to the <c>master</c> database,
///     used for create and drop operations on the target application database.
/// </summary>
public class MasterSqlConnectionFactory(IConfiguration configuration) : ISqlConnectionFactory
{
    /// <inheritdoc />
    public string ConnectionString
    {
        get
        {
            if (
                SqlConnectionStringHelper.TryGetMasterConnectionString(
                    configuration,
                    out var connectionString
                )
            )
                return connectionString;

            throw new InvalidOperationException(
                "Database connection string not configured. Set DB_SERVER, DB_USER, DB_PASSWORD env vars."
            );
        }
    }

    /// <inheritdoc />
    public SqlConnection CreateConnection()
    {
        return new SqlConnection(ConnectionString);
    }
}
