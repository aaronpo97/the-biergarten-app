using Domain.Entities;
using Domain.Exceptions;
using Features.Breweries.Commands.DeleteBrewery;
using Features.Breweries.Repository;
using FluentAssertions;
using Moq;

namespace Features.Breweries.Tests.Commands;

public class DeleteBreweryHandlerTests
{
    private readonly DeleteBreweryHandler _handler;
    private readonly Mock<IBreweryRepository> _repoMock = new();

    public DeleteBreweryHandlerTests()
    {
        _handler = new DeleteBreweryHandler(_repoMock.Object);
    }

    private void SetUpExistingBrewery(Guid breweryPostId, Guid postedById)
    {
        _repoMock
            .Setup(r => r.GetByIdAsync(breweryPostId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new BreweryPost { BreweryPostId = breweryPostId, PostedById = postedById });
    }

    [Fact]
    public async Task Handle_DelegatesToRepository_WhenRequestingUserIsThePoster()
    {
        Guid breweryPostId = Guid.NewGuid();
        Guid requestingUserId = Guid.NewGuid();
        SetUpExistingBrewery(breweryPostId, requestingUserId);
        _repoMock.Setup(r => r.DeleteAsync(breweryPostId)).Returns(Task.CompletedTask);

        await _handler.Handle(
            new DeleteBreweryCommand(breweryPostId, requestingUserId),
            CancellationToken.None
        );

        _repoMock.Verify(r => r.DeleteAsync(breweryPostId), Times.Once);
    }

    [Fact]
    public async Task Handle_ThrowsNotFoundException_WhenBreweryDoesNotExist()
    {
        DeleteBreweryCommand command = new(Guid.NewGuid(), Guid.NewGuid());

        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
        _repoMock.Verify(r => r.DeleteAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ThrowsForbiddenException_WhenRequestingUserIsNotThePoster()
    {
        Guid breweryPostId = Guid.NewGuid();
        SetUpExistingBrewery(breweryPostId, Guid.NewGuid());

        DeleteBreweryCommand command = new(breweryPostId, Guid.NewGuid());

        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ForbiddenException>();
        _repoMock.Verify(r => r.DeleteAsync(It.IsAny<Guid>()), Times.Never);
    }
}
