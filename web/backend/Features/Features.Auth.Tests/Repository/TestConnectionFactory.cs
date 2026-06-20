using System.Data.Common;
using Infrastructure.Sql;

namespace Features.Auth.Tests.Repository;

internal class TestConnectionFactory(DbConnection conn) : ISqlConnectionFactory
{
    private readonly DbConnection _conn = conn;

    public DbConnection CreateConnection() => _conn;
}
