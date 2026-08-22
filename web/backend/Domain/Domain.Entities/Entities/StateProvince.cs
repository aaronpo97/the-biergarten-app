namespace Domain.Entities;

public sealed class StateProvince
{
    // PK
    public Guid StateProvinceId { get; set; }

    // FK References
    public Guid CountryId { get; set; }

    // Attributes
    public string StateProvinceName { get; set; } = string.Empty;

    // this is the iso 3166-2 code for the state/province, e.g. "CA" for California, "ON" for Ontario, etc.
    // and is rendered like US-CA for California, CA-ON for Ontario, etc.
    public string Iso31662 { get; set; } = string.Empty;

    // Audit Fields
    public byte[]? RowVersion { get; set; }

    // Navigation Properties
    public Country? Country { get; set; }
}
