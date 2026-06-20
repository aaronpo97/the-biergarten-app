using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Queries.GetBreweryById;

/// <summary>
///     Handles <see cref="GetBreweryByIdQuery" /> by looking up the matching brewery post.
/// </summary>
/// <param name="repository">Repository used to query brewery post data.</param>
public class GetBreweryByIdHandler(IBreweryRepository repository)
    : IRequestHandler<GetBreweryByIdQuery, BreweryDto?>
{
    public async Task<BreweryDto?> Handle(
        GetBreweryByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        BreweryPost? brewery = await repository.GetByIdAsync(request.BreweryPostId);
        return brewery?.ToDto();
    }
}
