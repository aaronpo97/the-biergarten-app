namespace Domain.Entities;

public sealed class BreweryPost
{
    // PK
    public Guid BreweryPostId { get; set; }

    // FK References
    // Note: An empty GUID signifies that this object is incomplete
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
    public string PostedBy { get; set; } = string.Empty;

    // Query-computed
    public DistanceInformation? Distance { get; set; }
}
