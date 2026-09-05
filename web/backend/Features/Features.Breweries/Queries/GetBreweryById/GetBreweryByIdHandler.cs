using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Queries.GetBreweryById;

/// <summary>
///     Handles lookup requests for individual brewery posts.
/// </summary>
public class GetBreweryByIdHandler(IBreweryRepository repository)
    : IRequestHandler<GetBreweryByIdQuery, BreweryDto?>
{
    /// <summary>
    ///     Retrieves and maps the post, if it exists.
    /// </summary>
    public async Task<BreweryDto?> Handle(
        GetBreweryByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        BreweryPost? brewery = await repository.GetByIdAsync(
            request.BreweryPostId,
            cancellationToken
        );
        return brewery?.ToDto();
    }
}
