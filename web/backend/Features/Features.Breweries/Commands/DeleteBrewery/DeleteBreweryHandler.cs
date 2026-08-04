using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Commands.DeleteBrewery;

public class DeleteBreweryHandler(IBreweryRepository repository)
    : IRequestHandler<DeleteBreweryCommand>
{
    public Task Handle(DeleteBreweryCommand request, CancellationToken cancellationToken)
    {
        return repository.DeleteAsync(request.BreweryPostId);
    }
}
