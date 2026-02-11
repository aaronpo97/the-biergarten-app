using System.Data.Common;
using Repository.Core.Sql;

namespace Repository.Core.Repositories
{
    public abstract class Repository<T>(ISqlConnectionFactory connectionFactory)
        where T : class
    {
        protected async Task<DbConnection> CreateConnection()
        {
            var connection = connectionFactory.CreateConnection();
            await connection.OpenAsync();
            return connection;
        }

        protected abstract T MapToEntity(DbDataReader reader);
    }
}
