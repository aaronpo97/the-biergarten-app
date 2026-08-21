namespace Features.Locations.Dtos;

/// <summary>
///     Describes a city's location for resolution by <c>ILocationRepository</c>, including the
///     state/province and country it belongs to.
/// </summary>
public sealed record CityLocation(
    string CityName,
    string StateProvinceName,
    string StateProvinceIsoCode,
    string CountryName,
    string CountryIsoCode
);
