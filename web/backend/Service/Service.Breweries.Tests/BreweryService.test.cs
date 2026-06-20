using Domain.Entities;
using FluentAssertions;
using Infrastructure.Repository.Breweries;
using Moq;

namespace Service.Breweries.Tests;

public class BreweryServiceTests
{
    private readonly Mock<IBreweryRepository> _repoMock;
    private readonly BreweryService _service;

    public BreweryServiceTests()
    {
        _repoMock = new Mock<IBreweryRepository>();
        _service = new BreweryService(_repoMock.Object);
    }

    private static BreweryLocationCreateRequest ValidLocationCreateRequest() =>
        new(
            CityId: Guid.NewGuid(),
            AddressLine1: "123 Main St",
            AddressLine2: null,
            PostalCode: "12345",
            Coordinates: null
        );

    [Fact]
    public async Task GetByIdAsync_ReturnsBrewery_WhenFound()
    {
        var brewery = new BreweryPost { BreweryPostId = Guid.NewGuid() };
        _repoMock.Setup(r => r.GetByIdAsync(brewery.BreweryPostId))
            .ReturnsAsync(brewery);

        var result = await _service.GetByIdAsync(brewery.BreweryPostId);

        result.Should().Be(brewery);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        var id = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(id))
            .ReturnsAsync((BreweryPost?)null);

        var result = await _service.GetByIdAsync(id);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_PassesLimitAndOffset_ToRepository()
    {
        _repoMock.Setup(r => r.GetAllAsync(10, 5))
            .ReturnsAsync(Array.Empty<BreweryPost>());

        var result = await _service.GetAllAsync(10, 5);

        result.Should().BeEmpty();
        _repoMock.Verify(r => r.GetAllAsync(10, 5), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllBreweries_FromRepository()
    {
        var breweries = new[]
        {
            new BreweryPost { BreweryPostId = Guid.NewGuid() },
            new BreweryPost { BreweryPostId = Guid.NewGuid() },
        };
        _repoMock.Setup(r => r.GetAllAsync(null, null))
            .ReturnsAsync(breweries);

        var result = await _service.GetAllAsync();

        result.Should().BeEquivalentTo(breweries);
    }

    [Fact]
    public async Task CreateAsync_PersistsEntity_WithNewIdsAndCreatedAt()
    {
        var request = new BreweryCreateRequest(
            PostedById: Guid.NewGuid(),
            BreweryName: "MyBrew",
            Description: "Desc",
            Location: ValidLocationCreateRequest()
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.CreateAsync(It.IsAny<BreweryPost>()))
            .Callback<BreweryPost>(b => persisted = b)
            .Returns(Task.CompletedTask);

        var before = DateTime.UtcNow;
        var result = await _service.CreateAsync(request);
        var after = DateTime.UtcNow;

        result.Success.Should().BeTrue();
        persisted.Should().NotBeNull();
        persisted!.BreweryPostId.Should().NotBe(Guid.Empty);
        persisted.PostedById.Should().Be(request.PostedById);
        persisted.BreweryName.Should().Be("MyBrew");
        persisted.Description.Should().Be("Desc");
        persisted.CreatedAt.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
        persisted.UpdatedAt.Should().BeNull();

        persisted.Location.Should().NotBeNull();
        persisted.Location!.BreweryPostLocationId.Should().NotBe(Guid.Empty);
        persisted.Location.BreweryPostLocationId.Should().NotBe(persisted.BreweryPostId);
        persisted.Location.CityId.Should().Be(request.Location.CityId);
        persisted.Location.AddressLine1.Should().Be(request.Location.AddressLine1);
        persisted.Location.PostalCode.Should().Be(request.Location.PostalCode);

        _repoMock.Verify(r => r.CreateAsync(It.IsAny<BreweryPost>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ReturnsServiceReturn_WrappingTheCreatedEntity()
    {
        var request = new BreweryCreateRequest(
            PostedById: Guid.NewGuid(),
            BreweryName: "MyBrew",
            Description: "Desc",
            Location: ValidLocationCreateRequest()
        );

        _repoMock
            .Setup(r => r.CreateAsync(It.IsAny<BreweryPost>()))
            .Returns(Task.CompletedTask);

        var result = await _service.CreateAsync(request);

        result.Success.Should().BeTrue();
        result.Brewery.BreweryName.Should().Be("MyBrew");
        result.Brewery.Location.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_UpdatesNameDescription_AndSetsUpdatedAt()
    {
        var request = new BreweryUpdateRequest(
            BreweryPostId: Guid.NewGuid(),
            PostedById: Guid.NewGuid(),
            BreweryName: "Renamed",
            Description: "New description",
            Location: null
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<BreweryPost>()))
            .Callback<BreweryPost>(b => persisted = b)
            .Returns(Task.CompletedTask);

        var before = DateTime.UtcNow;
        var result = await _service.UpdateAsync(request);
        var after = DateTime.UtcNow;

        result.Success.Should().BeTrue();
        persisted.Should().NotBeNull();
        persisted!.BreweryPostId.Should().Be(request.BreweryPostId);
        persisted.PostedById.Should().Be(request.PostedById);
        persisted.BreweryName.Should().Be("Renamed");
        persisted.Description.Should().Be("New description");
        persisted.UpdatedAt.Should().NotBeNull();
        persisted.UpdatedAt!.Value.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
    }

    [Fact]
    public async Task UpdateAsync_ClearsLocation_WhenRequestLocationIsNull()
    {
        var request = new BreweryUpdateRequest(
            BreweryPostId: Guid.NewGuid(),
            PostedById: Guid.NewGuid(),
            BreweryName: "Name",
            Description: "Description",
            Location: null
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<BreweryPost>()))
            .Callback<BreweryPost>(b => persisted = b)
            .Returns(Task.CompletedTask);

        await _service.UpdateAsync(request);

        persisted!.Location.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_SetsLocation_WhenRequestLocationProvided()
    {
        var locationRequest = new BreweryLocationUpdateRequest(
            BreweryPostLocationId: Guid.NewGuid(),
            CityId: Guid.NewGuid(),
            AddressLine1: "456 Oak Ave",
            AddressLine2: "Suite 2",
            PostalCode: "54321",
            Coordinates: null
        );
        var request = new BreweryUpdateRequest(
            BreweryPostId: Guid.NewGuid(),
            PostedById: Guid.NewGuid(),
            BreweryName: "Name",
            Description: "Description",
            Location: locationRequest
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<BreweryPost>()))
            .Callback<BreweryPost>(b => persisted = b)
            .Returns(Task.CompletedTask);

        await _service.UpdateAsync(request);

        persisted!.Location.Should().NotBeNull();
        persisted.Location!.BreweryPostLocationId.Should().Be(locationRequest.BreweryPostLocationId);
        persisted.Location.BreweryPostId.Should().Be(request.BreweryPostId);
        persisted.Location.CityId.Should().Be(locationRequest.CityId);
        persisted.Location.AddressLine1.Should().Be(locationRequest.AddressLine1);
        persisted.Location.AddressLine2.Should().Be(locationRequest.AddressLine2);
        persisted.Location.PostalCode.Should().Be(locationRequest.PostalCode);
    }

    [Fact]
    public async Task DeleteAsync_DelegatesToRepository()
    {
        var id = Guid.NewGuid();
        _repoMock.Setup(r => r.DeleteAsync(id)).Returns(Task.CompletedTask);

        await _service.DeleteAsync(id);

        _repoMock.Verify(r => r.DeleteAsync(id), Times.Once);
    }
}
