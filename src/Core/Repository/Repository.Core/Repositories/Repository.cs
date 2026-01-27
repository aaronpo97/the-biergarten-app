using System.Data.Common;
using DataAccessLayer.Sql;

namespace DataAccessLayer.Repositories
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

        public abstract Task AddAsync(T entity);
        public abstract Task<IEnumerable<T>> GetAllAsync(int? limit, int? offset);
        public abstract Task<T?> GetByIdAsync(Guid id);
        public abstract Task UpdateAsync(T entity);
        public abstract Task DeleteAsync(Guid id);

        protected abstract T MapToEntity(DbDataReader reader);
    }
}
