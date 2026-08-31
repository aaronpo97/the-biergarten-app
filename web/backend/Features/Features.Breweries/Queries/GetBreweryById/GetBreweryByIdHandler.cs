using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Queries.GetBreweryById;

/// <summary>Handles <see cref="GetBreweryByIdQuery" /> by retrieving the matching brewery post.</summary>
public class GetBreweryByIdHandler(IBreweryRepository repository)
    : IRequestHandler<GetBreweryByIdQuery, BreweryDto?>
{
    /// <summary>Retrieves the brewery post, or <see langword="null"/> if none exists with the given ID.</summary>
    public async Task<BreweryDto?> Handle(
        GetBreweryByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        BreweryPost? brewery = await repository.GetByIdAsync(request.BreweryPostId, cancellationToken);
        return brewery?.ToDto();
    }
}
