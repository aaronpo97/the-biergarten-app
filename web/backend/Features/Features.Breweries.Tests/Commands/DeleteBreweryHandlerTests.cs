using Features.Breweries.Commands.DeleteBrewery;
using Features.Breweries.Repository;
using Moq;

namespace Features.Breweries.Tests.Commands;

public class DeleteBreweryHandlerTests
{
    [Fact]
    public async Task Handle_DelegatesToRepository()
    {
        Mock<IBreweryRepository> repoMock = new();
        DeleteBreweryHandler handler = new(repoMock.Object);
        Guid id = Guid.NewGuid();
        repoMock.Setup(r => r.DeleteAsync(id)).Returns(Task.CompletedTask);

        await handler.Handle(new DeleteBreweryCommand(id), CancellationToken.None);

        repoMock.Verify(r => r.DeleteAsync(id), Times.Once);
    }
}
