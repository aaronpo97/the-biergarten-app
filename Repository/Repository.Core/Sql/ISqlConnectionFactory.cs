using Microsoft.Data.SqlClient;

namespace DataAccessLayer.Sql
{
    public interface ISqlConnectionFactory
    {
        SqlConnection CreateConnection();
    }
}