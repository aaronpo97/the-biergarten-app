using Features.Breweries.Commands.DeleteBrewery;
using Features.Breweries.Repository;
using Moq;

namespace Features.Breweries.Tests.Commands;

public class DeleteBreweryHandlerTests
{
    [Fact]
    public async Task Handle_DelegatesToRepository()
    {
        var repoMock = new Mock<IBreweryRepository>();
        var handler = new DeleteBreweryHandler(repoMock.Object);
        var id = Guid.NewGuid();
        repoMock.Setup(r => r.DeleteAsync(id)).Returns(Task.CompletedTask);

        await handler.Handle(new DeleteBreweryCommand(id), CancellationToken.None);

        repoMock.Verify(r => r.DeleteAsync(id), Times.Once);
    }
}
