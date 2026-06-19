namespace Domain.Entities;

/// <summary>
/// Records that a <see cref="UserAccount"/> has completed verification (e.g., email confirmation).
/// Maps to the <c>UserVerification</c> table. A user account has at most one verification record,
/// and it is deleted automatically when the owning user account is deleted.
/// </summary>
public class UserVerification
{
   /// <summary>
   /// Primary key identifying this verification record. Maps to <c>UserVerificationID</c>.
   /// </summary>
   public Guid UserVerificationId { get; set; }

   /// <summary>
   /// Foreign key referencing the verified <see cref="UserAccount"/>. Maps to <c>UserAccountID</c>; unique, enforcing a one-to-one relationship.
   /// </summary>
   public Guid UserAccountId { get; set; }

   /// <summary>
   /// The date and time at which the user account was verified.
   /// </summary>
   public DateTime VerificationDateTime { get; set; }

   /// <summary>
   /// SQL Server <c>ROWVERSION</c> concurrency token used to detect concurrent updates. <c>null</c> until the row has been read from the database.
   /// </summary>
   public byte[]? Timer { get; set; }
}
