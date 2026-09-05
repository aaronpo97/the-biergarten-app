using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Queries.GetAllBreweries;

/// <summary>
///     Handles ordered, paged brewery-post queries.
/// </summary>
public class GetAllBreweriesHandler(IBreweryRepository repository)
    : IRequestHandler<GetAllBreweriesQuery, IEnumerable<BreweryDto>>
{
    /// <summary>
    ///     Retrieves and maps the requested page of brewery posts.
    /// </summary>
    public async Task<IEnumerable<BreweryDto>> Handle(
        GetAllBreweriesQuery request,
        CancellationToken cancellationToken
    )
    {
        IEnumerable<BreweryPost> breweries = await repository.GetAllAsync(
            request.Limit,
            request.Offset
        );
        return breweries.Select(b => b.ToDto());
    }
}
