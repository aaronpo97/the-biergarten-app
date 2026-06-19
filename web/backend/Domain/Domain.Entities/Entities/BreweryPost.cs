namespace Domain.Entities;

/// <summary>
/// Represents a user-submitted post about a brewery. Maps to the <c>BreweryPost</c> table.
/// A user account cannot be deleted while it has an associated brewery post.
/// </summary>
public class BreweryPost
{
    /// <summary>
    /// Primary key identifying this brewery post. Maps to <c>BreweryPostID</c>.
    /// </summary>
    public Guid BreweryPostId { get; set; }

    /// <summary>
    /// Foreign key referencing the <see cref="UserAccount"/> that authored this post. Maps to <c>PostedByID</c>.
    /// </summary>
    public Guid PostedById { get; set; }

    /// <summary>
    /// The name of the brewery being posted about.
    /// </summary>
    public string BreweryName { get; set; } = string.Empty;

    /// <summary>
    /// Free-text description of the brewery.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// The date and time the post was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// The date and time the post was last updated, or <c>null</c> if it has never been updated.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// SQL Server <c>ROWVERSION</c> concurrency token used to detect concurrent updates. <c>null</c> until the row has been read from the database.
    /// </summary>
    public byte[]? Timer { get; set; }

    /// <summary>
    /// The associated <see cref="BreweryPostLocation"/> for this post, if one has been set. This is a one-to-one navigation property.
    /// </summary>
    public BreweryPostLocation? Location { get; set; }
}
