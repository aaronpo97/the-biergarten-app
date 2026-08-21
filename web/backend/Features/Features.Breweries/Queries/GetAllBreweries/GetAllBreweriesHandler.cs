using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Queries.GetAllBreweries;

/// <summary>Handles <see cref="GetAllBreweriesQuery" /> by retrieving brewery posts, newest first.</summary>
public class GetAllBreweriesHandler(IBreweryRepository repository)
    : IRequestHandler<GetAllBreweriesQuery, IEnumerable<BreweryDto>>
{
    /// <summary>Retrieves brewery posts, newest first, applying <see cref="GetAllBreweriesQuery" />'s paging.</summary>
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
