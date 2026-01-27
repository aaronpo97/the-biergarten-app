using System.Data.Common;

namespace DataAccessLayer.Sql
{
    public interface ISqlConnectionFactory
    {
        DbConnection CreateConnection();
    }
}