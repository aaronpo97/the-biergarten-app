namespace Domain.Entities;

public class City
{
    public Guid CityId { get; set; }
    public string CityName { get; set; } = string.Empty;
    public Guid StateProvinceId { get; set; }

    public StateProvince? StateProvince { get; set; }

    public byte[]? Timer { get; set; }
}


public class StateProvince
{
    public Guid StateProvinceId { get; set; }
    public string StateProvinceName { get; set; } = string.Empty;

    // this is the iso 3166-2 code for the state/province, e.g. "CA" for California, "ON" for Ontario, etc.
    // and is rendered like US-CA for California, CA-ON for Ontario, etc.
    public string ISO3166_2 { get; set; } = string.Empty;
    public Guid CountryId { get; set; }

    public Country? Country { get; set; }

    public byte[]? Timer { get; set; }
}

public class Country
{
    public Guid CountryId { get; set; }
    public string CountryName { get; set; } = string.Empty;

    public string ISO3166_1 { get; set; } = string.Empty; // this is the iso 3166-1 alpha-2 code for the country, e.g. "US" for United States, "CA" for Canada, etc.

    public byte[]? Timer { get; set; }
}
