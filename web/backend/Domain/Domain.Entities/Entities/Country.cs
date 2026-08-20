namespace Domain.Entities;

public sealed class Country
{
    // PK
    public Guid CountryId { get; set; }

    // Attributes
    public string CountryName { get; set; } = string.Empty;

    public string ISO3166_1 { get; set; } = string.Empty; // this is the iso 3166-1 alpha-2 code for the country, e.g. "US" for United States, "CA" for Canada, etc.

    // Audit Fields
    public byte[]? RowVersion { get; set; }
}
