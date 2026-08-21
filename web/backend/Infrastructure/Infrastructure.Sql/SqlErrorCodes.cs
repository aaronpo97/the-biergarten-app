namespace Infrastructure.Sql;

/// <summary>
///     Custom SQL Server error numbers (50000+) that a stored procedure could use to signal
///     domain-level failures via <c>THROW</c>, for a repository to catch as
///     <see cref="Microsoft.Data.SqlClient.SqlException" /> and translate via <c>ex.Number</c> into
///     the corresponding <c>Domain.Exceptions</c> type.
/// </summary>
/// <remarks>
///     Currently unused: the schema has no stored procedures, and no repository throws or catches on
///     these numbers. Repositories instead run their own existence/concurrency checks and throw
///     <c>Domain.Exceptions</c> directly (see <c>docs/website/database.md</c> for the current
///     approach). This type is kept in case a future stored procedure reintroduces the pattern; each
///     number would
///     identify a category of error shared by every procedure that raises it, not a single call site.
/// </remarks>
public static class SqlErrorCodes
{
    /// <summary>
    ///     A stored procedure's own input validation failed (e.g. a required parameter was <c>NULL</c>).
    ///     Maps to HTTP 400 Bad Request.
    /// </summary>
    public const int Validation = 50400;

    /// <summary>
    ///     A stored procedure could not find a row it required, by primary key or foreign key. Maps to
    ///     HTTP 404 Not Found.
    /// </summary>
    public const int NotFound = 50404;

    /// <summary>
    ///     A stored procedure detected a conflict: either a duplicate/already-exists row, or a stale
    ///     optimistic-concurrency token (row-version mismatch). Maps to HTTP 409 Conflict.
    /// </summary>
    public const int Conflict = 50409;

    /// <summary>
    ///     A defensive check inside a stored procedure failed under conditions that should be
    ///     unreachable in normal operation (e.g. an <c>INSERT</c> that should always affect one row
    ///     affected zero). Left uncaught by repositories so it falls through to the generic
    ///     <see cref="Microsoft.Data.SqlClient.SqlException" /> handler. Maps to HTTP 500/503.
    /// </summary>
    public const int InternalFailure = 50500;
}
