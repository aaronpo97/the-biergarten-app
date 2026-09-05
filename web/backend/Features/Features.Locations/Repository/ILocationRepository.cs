using Features.Locations.Dtos;

namespace Features.Locations.Repository;

public interface ILocationRepository
{
    Task<CityDto?> GetCityByIdAsync(Guid cityId);

    Task<IEnumerable<CityDto>> GetAllCitiesAsync(int? limit, int? offset);

    Task<Guid?> GetCountryIdAsync(string isoCode);

    Task<Guid> CreateCountryAsync(string countryName, string isoCode);

    Task<Guid?> GetStateProvinceIdAsync(string isoCode);

    Task<Guid> CreateStateProvinceAsync(string stateProvinceName, string isoCode, Guid countryId);

    Task<Guid?> GetCityIdAsync(string cityName, string stateProvinceIsoCode);

    Task<Guid> CreateCityAsync(string cityName, Guid stateProvinceId);
}
