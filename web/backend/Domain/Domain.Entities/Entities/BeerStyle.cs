namespace Domain.Entities;

public sealed class BeerStyle
{
    // PK
    public Guid BeerStyleId { get; set; } = Guid.Empty;

    // Attributes
    public string BeerStyleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Audit Fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public byte[]? RowVersion { get; set; }
}
