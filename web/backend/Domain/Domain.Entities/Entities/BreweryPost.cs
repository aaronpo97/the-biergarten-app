namespace Domain.Entities;

public class BreweryPost
{
    public Guid BreweryPostId { get; set; }
    public Guid PostedById { get; set; }
    public string BreweryName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public byte[]? Timer { get; set; }
    public BreweryPostLocation? Location { get; set; }
}
