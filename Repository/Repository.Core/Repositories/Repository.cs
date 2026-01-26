using DataAccessLayer.Sql;
using Microsoft.Data.SqlClient;

namespace DataAccessLayer.Repositories
{
    public abstract class Repository<T>(ISqlConnectionFactory connectionFactory)
        where T : class
    {
        protected async Task<SqlConnection> CreateConnection()
        {
            var connection = connectionFactory.CreateConnection();
            await connection.OpenAsync();
            return connection;
        }

        public abstract Task Add(T entity);
        public abstract Task<IEnumerable<T>> GetAll(int? limit, int? offset);
        public abstract Task<T?> GetById(Guid id);
        public abstract Task Update(T entity);
        public abstract Task Delete(Guid id);

        protected abstract T MapToEntity(SqlDataReader reader);
    }
}
