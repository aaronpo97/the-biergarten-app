namespace Domain.Entities;

public sealed class Photo
{
    // PK
    public Guid PhotoId { get; set; }

    // FK References
    public Guid UploadedById { get; set; }

    // Attributes
    public string? Hyperlink { get; set; }

    // Audit Fields
    public DateTime UploadedAt { get; set; }
    public byte[]? RowVersion { get; set; }
}
