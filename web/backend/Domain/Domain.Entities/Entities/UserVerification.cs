namespace Domain.Entities;

public sealed class UserVerification
{
    // PK
    public Guid UserVerificationId { get; set; }

    // FK References
    public Guid UserAccountId { get; set; }

    // Attributes
    public DateTime VerificationDateTime { get; set; }

    // Audit Fields
    public byte[]? RowVersion { get; set; }
}
