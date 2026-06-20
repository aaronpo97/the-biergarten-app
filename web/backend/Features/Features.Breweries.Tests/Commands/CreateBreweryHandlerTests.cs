using Domain.Entities;
using Features.Breweries.Commands.CreateBrewery;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using FluentAssertions;
using Moq;

namespace Features.Breweries.Tests.Commands;

public class CreateBreweryHandlerTests
{
    private readonly CreateBreweryHandler _handler;
    private readonly Mock<IBreweryRepository> _repoMock = new();

    public CreateBreweryHandlerTests()
    {
        _handler = new CreateBreweryHandler(_repoMock.Object);
    }

    private static CreateBreweryLocation ValidLocation()
    {
        return new CreateBreweryLocation(Guid.NewGuid(), "123 Main St", null, "12345", null);
    }

    [Fact]
    public async Task Handle_PersistsEntity_WithNewIdsAndCreatedAt()
    {
        CreateBreweryCommand command = new(Guid.NewGuid(), "MyBrew", "Desc", ValidLocation());

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.CreateAsync(It.IsAny<BreweryPost>()))
            .Callback<BreweryPost>(b => persisted = b)
            .Returns(Task.CompletedTask);

        DateTime before = DateTime.UtcNow;
        BreweryDto result = await _handler.Handle(command, CancellationToken.None);
        DateTime after = DateTime.UtcNow;

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
