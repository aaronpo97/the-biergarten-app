using System.Data.Common;
using Repository.Core.Sql;

namespace Repository.Tests.Database;

internal class TestConnectionFactory(DbConnection conn) : ISqlConnectionFactory
{
    private readonly DbConnection _conn = conn;
    public DbConnection CreateConnection() => _conn;
}
