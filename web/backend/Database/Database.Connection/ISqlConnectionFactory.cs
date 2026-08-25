using Microsoft.Data.SqlClient;

namespace Database.Connection;

public interface ISqlConnectionFactory
{
    public string ConnectionString { get; }

    public SqlConnection CreateConnection();
}
