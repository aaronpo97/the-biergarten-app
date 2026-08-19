namespace Domain.Entities;

public sealed class City
{
    // PK
    public Guid CityId { get; set; }

    // FK References
    public Guid StateProvinceId { get; set; }

    // Attributes
    public string CityName { get; set; } = string.Empty;

    // Audit Fields
    public byte[]? RowVersion { get; set; }

    // Navigation Properties
    public StateProvince? StateProvince { get; set; }
}


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
    public string ISO3166_2 { get; set; } = string.Empty;

    // Audit Fields
    public byte[]? RowVersion { get; set; }

    // Navigation Properties
    public Country? Country { get; set; }
}

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
