using Microsoft.Data.SqlClient;

namespace Repository.Core.Sql
{
    public static class SqlConnectionStringHelper
    {
        /// <summary>
        /// Builds a SQL Server connection string from environment variables.
        /// Expects DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD, and DB_TRUST_SERVER_CERTIFICATE.
        /// </summary>
        /// <param name="databaseName">Optional override for the database name. If null, uses DB_NAME env var.</param>
        /// <returns>A properly formatted SQL Server connection string.</returns>
        public static string BuildConnectionString(string? databaseName = null)
        {
            var server = Environment.GetEnvironmentVariable("DB_SERVER")
                ?? throw new InvalidOperationException("DB_SERVER environment variable is not set");

            var dbName = databaseName
                ?? Environment.GetEnvironmentVariable("DB_NAME")
                ?? throw new InvalidOperationException("DB_NAME environment variable is not set");

            var user = Environment.GetEnvironmentVariable("DB_USER")
                ?? throw new InvalidOperationException("DB_USER environment variable is not set");

            var password = Environment.GetEnvironmentVariable("DB_PASSWORD")
                ?? throw new InvalidOperationException("DB_PASSWORD environment variable is not set");

            var builder = new SqlConnectionStringBuilder
            {
                DataSource = server,
                InitialCatalog = dbName,
                UserID = user,
                Password = password,
                TrustServerCertificate = true,
                Encrypt = true
            };

            return builder.ConnectionString;
        }

        /// <summary>
        /// Builds a connection string to the master database using environment variables.
        /// </summary>
        /// <returns>A connection string for the master database.</returns>
        public static string BuildMasterConnectionString()
        {
            return BuildConnectionString("master");
        }
    }
}
