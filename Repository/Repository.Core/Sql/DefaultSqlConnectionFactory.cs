using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;


namespace DataAccessLayer.Sql
{
    public class DefaultSqlConnectionFactory(IConfiguration configuration) : ISqlConnectionFactory
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
                                                    ?? configuration.GetConnectionString("Default")
                                                    ?? throw new InvalidOperationException(
                                                        "Database connection string not configured. Set DB_CONNECTION_STRING env var or ConnectionStrings:Default."
                                                    );

        public SqlConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }
    }
}
