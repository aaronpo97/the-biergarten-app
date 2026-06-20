using Domain.Entities;
using FluentAssertions;
using Features.Breweries.Commands.CreateBrewery;
using Features.Breweries.Repository;
using Moq;

namespace Features.Breweries.Tests.Commands;

public class CreateBreweryHandlerTests
{
    private readonly Mock<IBreweryRepository> _repoMock = new();
    private readonly CreateBreweryHandler _handler;

    public CreateBreweryHandlerTests()
    {
        _handler = new CreateBreweryHandler(_repoMock.Object);
    }

    private static CreateBreweryLocation ValidLocation() =>
        new(
            CityId: Guid.NewGuid(),
            AddressLine1: "123 Main St",
            AddressLine2: null,
            PostalCode: "12345",
            Coordinates: null
        );

    [Fact]
    public async Task Handle_PersistsEntity_WithNewIdsAndCreatedAt()
    {
        var command = new CreateBreweryCommand(
            PostedById: Guid.NewGuid(),
            BreweryName: "MyBrew",
            Description: "Desc",
            Location: ValidLocation()
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.CreateAsync(It.IsAny<BreweryPost>()))
            .Callback<BreweryPost>(b => persisted = b)
            .Returns(Task.CompletedTask);

        var before = DateTime.UtcNow;
        var result = await _handler.Handle(command, CancellationToken.None);
        var after = DateTime.UtcNow;

        persisted.Should().NotBeNull();
        persisted!.BreweryPostId.Should().NotBe(Guid.Empty);
        persisted.PostedById.Should().Be(command.PostedById);
        persisted.BreweryName.Should().Be("MyBrew");
        persisted.Description.Should().Be("Desc");
        persisted.CreatedAt.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
        persisted.UpdatedAt.Should().BeNull();

        persisted.Location.Should().NotBeNull();
        persisted.Location!.BreweryPostLocationId.Should().NotBe(Guid.Empty);
        persisted.Location.BreweryPostLocationId.Should().NotBe(persisted.BreweryPostId);
        persisted.Location.CityId.Should().Be(command.Location.CityId);
        persisted.Location.AddressLine1.Should().Be(command.Location.AddressLine1);
        persisted.Location.PostalCode.Should().Be(command.Location.PostalCode);

        _repoMock.Verify(r => r.CreateAsync(It.IsAny<BreweryPost>()), Times.Once);

        result.BreweryName.Should().Be("MyBrew");
        result.Location.Should().NotBeNull();
    }
}
