using Apps72.Dev.Data.DbMocker;
using FluentAssertions;
using Infrastructure.Repository.Breweries;
using Infrastructure.Repository.Tests.Database;
using Domain.Entities;

namespace Infrastructure.Repository.Tests.Breweries;

public class BreweryRepositoryTest
{
    private static BreweryRepository CreateRepo(MockDbConnection conn) =>
        new(new TestConnectionFactory(conn));

    [Fact]
    public async Task GetByIdAsync_ReturnsBrewery_WhenExists()
    {
        var breweryId = Guid.NewGuid();
        var conn = new MockDbConnection();

        // Repository calls the stored procedure
        const string getByIdSql = "USP_GetBreweryById";

        var locationId = Guid.NewGuid();

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

        var repo = CreateRepo(conn);
        var result = await repo.GetByIdAsync(breweryId);
        result.Should().NotBeNull();
        result!.BreweryPostId.Should().Be(breweryId);
        result.Location.Should().NotBeNull();
        result.Location!.BreweryPostLocationId.Should().Be(locationId);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        var conn = new MockDbConnection();
        conn.Mocks.When(cmd => cmd.CommandText == "USP_GetBreweryById")
            .ReturnsTable(MockTable.Empty());
        var repo = CreateRepo(conn);
        var result = await repo.GetByIdAsync(Guid.NewGuid());
        result.Should().BeNull();

    }

    [Fact]
    public async Task CreateAsync_ExecutesSuccessfully()
    {
        var conn = new MockDbConnection();
        conn.Mocks.When(cmd => cmd.CommandText == "USP_CreateBrewery")
            .ReturnsScalar(1);
        var repo = CreateRepo(conn);
        var brewery = new BreweryPost
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
        var act = async () => await repo.CreateAsync(brewery);
        await act.Should().NotThrowAsync();
    }
}
