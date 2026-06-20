namespace Domain.Entities;

/// <summary>
///     Represents the physical location of a <see cref="BreweryPost" />. Maps to the <c>BreweryPostLocation</c> table.
///     Each brewery post has at most one location, and the location is deleted automatically when its parent post is
///     deleted.
/// </summary>
public class BreweryPostLocation
{
    /// <summary>
    ///     Primary key identifying this location. Maps to <c>BreweryPostLocationID</c>.
    /// </summary>
    public Guid BreweryPostLocationId { get; set; }

    /// <summary>
    ///     Foreign key referencing the owning <see cref="BreweryPost" />. Maps to <c>BreweryPostID</c>; unique, enforcing a
    ///     one-to-one relationship.
    /// </summary>
    public Guid BreweryPostId { get; set; }

    /// <summary>
    ///     The primary street address line.
    /// </summary>
    public string AddressLine1 { get; set; } = string.Empty;

    /// <summary>
    ///     An optional secondary address line (e.g., suite or unit number).
    /// </summary>
    public string? AddressLine2 { get; set; }

    /// <summary>
    ///     The postal/ZIP code of the location.
    /// </summary>
    public string PostalCode { get; set; } = string.Empty;

    /// <summary>
    ///     Foreign key referencing the city in which the brewery is located. Maps to <c>CityID</c>.
    /// </summary>
    public Guid CityId { get; set; }

    /// <summary>
    ///     Serialized SQL Server <c>GEOGRAPHY</c> value representing the geographic coordinates of the location, or
    ///     <c>null</c> if not set.
    /// </summary>
    public byte[]? Coordinates { get; set; }

    /// <summary>
    ///     SQL Server <c>ROWVERSION</c> concurrency token used to detect concurrent updates. <c>null</c> until the row has
    ///     been read from the database.
    /// </summary>
    public byte[]? Timer { get; set; }
}
