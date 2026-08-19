namespace Domain.Entities;

public sealed class BreweryPost
{
    // PK
    public Guid BreweryPostId { get; set; }

    // FK References
    public Guid PostedById { get; set; }

    // Attributes
    public string BreweryName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Audit Fields
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public byte[]? RowVersion { get; set; }

    // Navigation Properties
    public BreweryPostLocation? Location { get; set; }
    public List<BeerPost> BeerPosts { get; set; } = [];
}
