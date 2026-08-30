namespace Domain.Entities;

public sealed class UserProfile
{
    // PK
    public Guid UserProfileId { get; set; }

    // FK References
    public Guid UserAccountId { get; set; }

    // Attributes
    public string Biography { get; set; } = string.Empty;

    // Audit Fields
    public byte[]? RowVersion { get; set; }
}
