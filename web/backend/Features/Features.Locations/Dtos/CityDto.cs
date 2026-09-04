namespace Features.Locations.Dtos;

public record CityDto(
    Guid CityId,
    string CityName,
    string StateProvinceName,
    string StateProvinceCode,
    string CountryName,
    string CountryCode,
    int BreweryCount
);
