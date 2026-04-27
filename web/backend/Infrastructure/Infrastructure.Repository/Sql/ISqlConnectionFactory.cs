using System.Data.Common;

namespace Infrastructure.Repository.Sql;

public interface ISqlConnectionFactory
{
    DbConnection CreateConnection();
}
