using System.Data.Common;

namespace Infrastructure.Sql;

/// <summary>
///     Factory for creating database connections used by repositories.
/// </summary>
public interface ISqlConnectionFactory
{
    /// <summary>
    ///     Creates a new, unopened database connection.
    /// </summary>
    DbConnection CreateConnection();
}
