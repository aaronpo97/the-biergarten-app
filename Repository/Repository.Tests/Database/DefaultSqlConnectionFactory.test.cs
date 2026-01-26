using DataAccessLayer.Sql;
using FluentAssertions;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Repository.Tests.Database;

public class DefaultSqlConnectionFactoryTest
{
    private static IConfiguration EmptyConfig()
        => new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();

    [Fact]
    public void CreateConnection_Uses_EnvVar_WhenAvailable()
    {
        var previous = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
        try
        {
            Environment.SetEnvironmentVariable("DB_CONNECTION_STRING", "Server=localhost;Database=TestDb;Trusted_Connection=True;Encrypt=False");
            var factory = new DefaultSqlConnectionFactory(EmptyConfig());

            var conn = factory.CreateConnection();
            conn.Should().BeOfType<SqlConnection>();
            conn.ConnectionString.Should().Contain("Database=TestDb");
        }
        finally
        {
            Environment.SetEnvironmentVariable("DB_CONNECTION_STRING", previous);
        }
    }

    [Fact]
    public void CreateConnection_Uses_Config_WhenEnvMissing()
    {
        var previous = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
        try
        {
            Environment.SetEnvironmentVariable("DB_CONNECTION_STRING", null);
            var cfg = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "ConnectionStrings:Default", "Server=localhost;Database=CfgDb;Trusted_Connection=True;Encrypt=False" }
                })
                .Build();

            var factory = new DefaultSqlConnectionFactory(cfg);
            var conn = factory.CreateConnection();
            conn.ConnectionString.Should().Contain("Database=CfgDb");
        }
        finally
        {
            Environment.SetEnvironmentVariable("DB_CONNECTION_STRING", previous);
        }
    }

    [Fact]
    public void Constructor_Throws_When_NoEnv_NoConfig()
    {
        var previous = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
        try
        {
            Environment.SetEnvironmentVariable("DB_CONNECTION_STRING", null);
            var cfg = EmptyConfig();
            Action act = () => _ = new DefaultSqlConnectionFactory(cfg);
            act.Should().Throw<InvalidOperationException>()
                .WithMessage("*Database connection string not configured*");
        }
        finally
        {
            Environment.SetEnvironmentVariable("DB_CONNECTION_STRING", previous);
        }
    }
}