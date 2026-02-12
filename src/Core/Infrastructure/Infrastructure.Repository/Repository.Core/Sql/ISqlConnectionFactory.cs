using System.Data.Common;

namespace Repository.Core.Sql
{
    public interface ISqlConnectionFactory
    {
        DbConnection CreateConnection();
    }
}
