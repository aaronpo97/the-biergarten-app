using System.Data.Common;
using Infrastructure.Repository.Sql;

namespace Repository.Tests.Database;

internal class TestConnectionFactory(DbConnection conn) : ISqlConnectionFactory
{
    private readonly DbConnection _conn = conn;

    public DbConnection CreateConnection() => _conn;
}
