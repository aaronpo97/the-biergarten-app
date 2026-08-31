using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Queries.GetAllBreweryLocations;

/// <summary>Handles <see cref="GetAllBreweryLocationsQuery" /> by retrieving all located brewery posts.</summary>
public class GetAllBreweryLocationsHandler(IBreweryRepository repository)
    : IRequestHandler<GetAllBreweryLocationsQuery, IEnumerable<BreweryWithLocationDto>>
{
    /// <summary>Retrieves every brewery post that has a set location.</summary>
    public async Task<IEnumerable<BreweryWithLocationDto>> Handle(
        GetAllBreweryLocationsQuery request,
        CancellationToken cancellationToken
    )
    {
        IEnumerable<BreweryPost> breweries = await repository.GetAllLocations();
        return breweries.Select(b => b.ToSimplifiedDto());
    }
}
