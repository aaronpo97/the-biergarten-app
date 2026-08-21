using Features.Locations.Dtos;

namespace Features.Locations.Repository;

/// <summary>
///     Resolves the Country/StateProvince/City location hierarchy shared by features that attach a
///     location to a record (e.g. brewery posts, and eventually user accounts).
/// </summary>
public interface ILocationRepository
{
    /// <summary>
    ///     Resolves <paramref name="location" /> to a City ID, creating the Country, StateProvince,
    ///     and/or City rows if any part of the chain doesn't exist yet.
    /// </summary>
    Task<Guid> GetOrCreateCityIdAsync(CityLocation location);
}
