using Apps72.Dev.Data.DbMocker;
using Domain.Entities;
using Features.Breweries.Repository;
using FluentAssertions;

namespace Features.Breweries.Tests.Repository;

public class BreweryRepositoryTests
{
    private static BreweryRepository CreateRepo(MockDbConnection conn)
    {
        return new BreweryRepository(new TestConnectionFactory(conn));
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsBrewery_WhenExists()
    {
        Guid breweryId = Guid.NewGuid();
        MockDbConnection conn = new();

        // Repository calls the stored procedure
        const string getByIdSql = "USP_GetBreweryById";

        Guid locationId = Guid.NewGuid();

        conn.Mocks.When(cmd => cmd.CommandText == getByIdSql)
            .ReturnsTable(
                MockTable
                    .WithColumns(
                        ("BreweryPostId", typeof(Guid)),
                        ("PostedById", typeof(Guid)),
                        ("BreweryName", typeof(string)),
                        ("Description", typeof(string)),
                        ("CreatedAt", typeof(DateTime)),
                        ("UpdatedAt", typeof(DateTime?)),
                        ("Timer", typeof(byte[])),
                        ("BreweryPostLocationId", typeof(Guid)),
                        ("CityId", typeof(Guid)),
                        ("AddressLine1", typeof(string)),
                        ("AddressLine2", typeof(string)),
                        ("PostalCode", typeof(string)),
                        ("Coordinates", typeof(byte[]))
                    )
                    .AddRow(
                        breweryId,
                        Guid.NewGuid(),
                        "Test Brewery",
                        "A test brewery description",
                        DateTime.UtcNow,
                        null,
                        null,
                        locationId,
                        Guid.NewGuid(),
                        "123 Main St",
                        null,
                        "12345",
                        null
                    )
            );

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost? result = await repo.GetByIdAsync(breweryId);
        result.Should().NotBeNull();
        result!.BreweryPostId.Should().Be(breweryId);
        result.Location.Should().NotBeNull();
        result.Location!.BreweryPostLocationId.Should().Be(locationId);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText == "USP_GetBreweryById")
            .ReturnsTable(MockTable.Empty());
        BreweryRepository repo = CreateRepo(conn);
        BreweryPost? result = await repo.GetByIdAsync(Guid.NewGuid());
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_ExecutesSuccessfully()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText == "USP_CreateBrewery")
            .ReturnsScalar(1);
        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new()
        {
            BreweryPostId = Guid.NewGuid(),
            PostedById = Guid.NewGuid(),
            BreweryName = "Test Brewery",
            Description = "A test brewery description",
            CreatedAt = DateTime.UtcNow,
            Location = new BreweryPostLocation
            {
                BreweryPostLocationId = Guid.NewGuid(),
                CityId = Guid.NewGuid(),
                AddressLine1 = "123 Main St",
                PostalCode = "12345",
                Coordinates = [0x00, 0x01]
            }
        };

        // Should not throw
        Func<Task> act = async () => await repo.CreateAsync(brewery);
        await act.Should().NotThrowAsync();
    }
}