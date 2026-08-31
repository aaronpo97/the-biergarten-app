using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Queries.GetBreweryLocationsWithinRange;

/// <summary>
///     Handles <see cref="GetBreweryLocationsWithinRangeQuery" /> by retrieving nearby located brewery posts.
/// </summary>
public class GetBreweryLocationsWithinRangeHandler(IBreweryRepository repository)
    : IRequestHandler<GetBreweryLocationsWithinRangeQuery, IEnumerable<BreweryWithLocationDto>>
{
    /// <summary>Retrieves brewery posts within range of the requested coordinates, nearest first.</summary>
    public async Task<IEnumerable<BreweryWithLocationDto>> Handle(
        GetBreweryLocationsWithinRangeQuery request,
        CancellationToken cancellationToken
    )
    {
        IEnumerable<BreweryPost> breweries = await repository.GetAllLocationsWithinRange(
            new CoordinateData(request.Latitude, request.Longitude),
            request.RangeInMetres
        );
        return breweries.Select(b => b.ToSimplifiedDto());
    }
}
