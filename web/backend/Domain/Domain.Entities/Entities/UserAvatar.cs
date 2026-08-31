namespace Domain.Entities;

public sealed class UserAvatar
{
    // PK
    public Guid UserAvatarId { get; set; }

    // FK References
    public Guid UserProfileId { get; set; }
    public Guid PhotoId { get; set; }

    // Attributes
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }

    // Navigation Field
    public Photo? Photo { get; set; }
    // Audit Fields
    public byte[]? RowVersion { get; set; }
}
