namespace Domain.Entities;

/// <summary>
///     Represents a registered user of the application. Maps to the <c>UserAccount</c> table, the root entity
///     referenced by <see cref="UserCredential" />, <see cref="UserVerification" />, brewery posts, and other user-owned
///     data.
/// </summary>
public class UserAccount
{
    /// <summary>
    ///     Primary key identifying this user account. Maps to <c>UserAccountID</c>.
    /// </summary>
    public Guid UserAccountId { get; set; }

    /// <summary>
    ///     The user's unique username, used for login and display. Enforced unique at the database level.
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    ///     The user's first name.
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    ///     The user's last name.
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    ///     The user's email address. Enforced unique at the database level.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    ///     The date and time the account was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    ///     The date and time the account was last updated, or <c>null</c> if it has never been updated.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    ///     The user's date of birth.
    /// </summary>
    public DateTime DateOfBirth { get; set; }

    /// <summary>
    ///     SQL Server <c>ROWVERSION</c> concurrency token used to detect concurrent updates. <c>null</c> until the row has
    ///     been read from the database.
    /// </summary>
    public byte[]? Timer { get; set; }
}
