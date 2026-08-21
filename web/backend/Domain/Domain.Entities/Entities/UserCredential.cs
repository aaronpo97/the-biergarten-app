namespace Domain.Entities;

public sealed class UserCredential
{
    // PK
    public Guid UserCredentialId { get; set; }

    // FK References
    public Guid UserAccountId { get; set; }

    // Attributes
    public DateTime Expiry { get; set; }
    public string Hash { get; set; } = string.Empty;
    public bool IsRevoked { get; set; }
    public DateTime? RevokedAt { get; set; }

    // Audit Fields
    public DateTime CreatedAt { get; set; }
    public byte[]? RowVersion { get; set; }
}
