namespace Domain.Entities;

/// <summary>
///     Represents an issued authentication credential (refresh token) for a <see cref="UserAccount" />.
///     Maps to the <c>UserCredential</c> table. Credentials are deleted automatically when the owning user account is
///     deleted.
/// </summary>
public class UserCredential
{
   /// <summary>
   ///     Primary key identifying this credential. Maps to <c>UserCredentialID</c>.
   /// </summary>
   public Guid UserCredentialId { get; set; }

   /// <summary>
   ///     Foreign key referencing the owning <see cref="UserAccount" />. Maps to <c>UserAccountID</c>.
   /// </summary>
   public Guid UserAccountId { get; set; }

   /// <summary>
   ///     The date and time the credential was issued.
   /// </summary>
   public DateTime CreatedAt { get; set; }

   /// <summary>
   ///     The date and time after which the credential is no longer valid.
   /// </summary>
   public DateTime Expiry { get; set; }

   /// <summary>
   ///     The Argon2 hash of the credential's secret value. The plaintext secret is never persisted.
   /// </summary>
   public string Hash { get; set; } = string.Empty;

   /// <summary>
   ///     SQL Server <c>ROWVERSION</c> concurrency token used to detect concurrent updates. <c>null</c> until the row has
   ///     been read from the database.
   /// </summary>
   public byte[]? Timer { get; set; }
}