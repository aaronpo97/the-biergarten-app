namespace Domain.Entities;

public sealed class BeerPost
{
    // PK
    public Guid BeerPostId { get; set; } = Guid.Empty;

    // FK References
    public Guid PostedById { get; set; } = Guid.Empty;
    public Guid BeerStyleId { get; set; } = Guid.Empty;
    public Guid BrewedById { get; set; } = Guid.Empty;

    // Attributes
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal ABV { get; set; }
    public int IBU { get; set; }

    // Audit Fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public byte[]? RowVersion { get; set; }

    // Navigation Properties
    public UserAccount? PostedBy { get; set; }
    public BreweryPost? BrewedBy { get; set; }

    public BeerStyle? BeerStyle { get; set; }
}
