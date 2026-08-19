using Apps72.Dev.Data.DbMocker;
using Domain.Entities;
using Domain.Exceptions;
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

        Guid locationId = Guid.NewGuid();
        Guid cityId = Guid.NewGuid();
        Guid stateProvinceId = Guid.NewGuid();
        Guid countryId = Guid.NewGuid();

        conn.Mocks.When(cmd => cmd.CommandText.Contains("LEFT JOIN dbo.BreweryPostLocation"))
            .ReturnsTable(
                MockTable
                    .WithColumns(
                        ("BreweryPostId", typeof(Guid)),
                        ("PostedById", typeof(Guid)),
                        ("BreweryName", typeof(string)),
                        ("Description", typeof(string)),
                        ("CreatedAt", typeof(DateTime)),
                        ("UpdatedAt", typeof(DateTime?)),
                        ("RowVersion", typeof(byte[])),
                        ("BreweryPostLocationId", typeof(Guid)),
                        ("CityId", typeof(Guid)),
                        ("AddressLine1", typeof(string)),
                        ("AddressLine2", typeof(string)),
                        ("PostalCode", typeof(string)),
                        ("Coordinates", typeof(byte[])),
                        ("CityName", typeof(string)),
                        ("StateProvinceId", typeof(Guid)),
                        ("StateProvinceName", typeof(string)),
                        ("ISO3166_2", typeof(string)),
                        ("CountryId", typeof(Guid)),
                        ("CountryName", typeof(string)),
                        ("ISO3166_1", typeof(string))
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
                        cityId,
                        "123 Main St",
                        null,
                        "12345",
                        null,
                        "Portland",
                        stateProvinceId,
                        "Oregon",
                        "US-OR",
                        countryId,
                        "United States",
                        "US"
                    )
            );

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost? result = await repo.GetByIdAsync(breweryId);
        result.Should().NotBeNull();
        result!.BreweryPostId.Should().Be(breweryId);
        result.Location.Should().NotBeNull();
        result.Location!.BreweryPostLocationId.Should().Be(locationId);
        result.Location.City.Should().NotBeNull();
        result.Location.City.CityName.Should().Be("Portland");
        result.Location.City.StateProvince.Should().NotBeNull();
        result.Location.City.StateProvince.StateProvinceName.Should().Be("Oregon");
        result.Location.City.StateProvince.Country.Should().NotBeNull();
        result.Location.City.StateProvince.Country.CountryName.Should().Be("United States");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("LEFT JOIN dbo.BreweryPostLocation"))
            .ReturnsTable(MockTable.Empty());
        BreweryRepository repo = CreateRepo(conn);
        BreweryPost? result = await repo.GetByIdAsync(Guid.NewGuid());
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_ExecutesSuccessfully()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.UserAccount")).ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.City")).ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.BreweryPost (")).ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.BreweryPostLocation"))
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
                Coordinates = [0x00, 0x01],
            },
        };

        // Should not throw
        Func<Task> act = async () => await repo.CreateAsync(brewery);
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task CreateAsync_ThrowsArgumentException_WhenLocationMissing()
    {
        MockDbConnection conn = new();
        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new()
        {
            BreweryPostId = Guid.NewGuid(),
            PostedById = Guid.NewGuid(),
            BreweryName = "Test Brewery",
            Description = "A test brewery description",
        };

        Func<Task> act = async () => await repo.CreateAsync(brewery);
        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task CreateAsync_ThrowsNotFound_WhenUserMissing()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.UserAccount"))
            .ReturnsScalar((int?)null);

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new()
        {
            BreweryPostId = Guid.NewGuid(),
            PostedById = Guid.NewGuid(),
            BreweryName = "Test Brewery",
            Description = "A test brewery description",
            Location = new BreweryPostLocation
            {
                BreweryPostLocationId = Guid.NewGuid(),
                CityId = Guid.NewGuid(),
                AddressLine1 = "123 Main St",
                PostalCode = "12345",
            },
        };

        Func<Task> act = async () => await repo.CreateAsync(brewery);
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task CreateAsync_UsesClientProvidedIds()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.UserAccount")).ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.City")).ReturnsScalar(1);

        Guid? capturedBreweryPostId = null;
        Guid? capturedLocationId = null;

        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.BreweryPost ("))
            .ReturnsScalar(cmd =>
            {
                capturedBreweryPostId = (Guid?)
                    cmd.Parameters.First(p => p.ParameterName == "BreweryPostId").Value;
                return 1;
            });

        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.BreweryPostLocation"))
            .ReturnsScalar(cmd =>
            {
                capturedLocationId = (Guid?)
                    cmd.Parameters.First(p => p.ParameterName == "BreweryPostLocationId").Value;
                return 1;
            });

        Guid expectedBreweryId = Guid.NewGuid();
        Guid expectedLocationId = Guid.NewGuid();

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new()
        {
            BreweryPostId = expectedBreweryId,
            PostedById = Guid.NewGuid(),
            BreweryName = "Test Brewery",
            Description = "A test brewery description",
            Location = new BreweryPostLocation
            {
                BreweryPostLocationId = expectedLocationId,
                CityId = Guid.NewGuid(),
                AddressLine1 = "123 Main St",
                PostalCode = "12345",
            },
        };

        await repo.CreateAsync(brewery);

        capturedBreweryPostId.Should().Be(expectedBreweryId);
        capturedLocationId.Should().Be(expectedLocationId);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFreshlyPersistedBrewery_WhenSuccessful()
    {
        Guid breweryId = Guid.NewGuid();
        byte[] newRowVersion = [0x00, 0x02];
        MockDbConnection conn = new();

        conn.Mocks.When(cmd =>
                cmd.CommandText.Contains("SELECT 1 FROM dbo.BreweryPost WHERE BreweryPostID")
            )
            .ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.City")).ReturnsScalar(1);
        conn.Mocks.When(cmd =>
                cmd.CommandText.Contains("WHERE BreweryPostID = @BreweryPostId AND RowVersion = @RowVersion")
            )
            .ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.BreweryPostLocation"))
            .ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("UPDATE dbo.BreweryPostLocation"))
            .ReturnsScalar(1);

        // Repository re-fetches the row after a successful update to return the new RowVersion.
        conn.Mocks.When(cmd => cmd.CommandText.Contains("LEFT JOIN dbo.BreweryPostLocation"))
            .ReturnsTable(
                MockTable
                    .WithColumns(
                        ("BreweryPostId", typeof(Guid)),
                        ("PostedById", typeof(Guid)),
                        ("BreweryName", typeof(string)),
                        ("Description", typeof(string)),
                        ("CreatedAt", typeof(DateTime)),
                        ("UpdatedAt", typeof(DateTime?)),
                        ("RowVersion", typeof(byte[])),
                        ("BreweryPostLocationId", typeof(Guid)),
                        ("CityId", typeof(Guid)),
                        ("AddressLine1", typeof(string)),
                        ("AddressLine2", typeof(string)),
                        ("PostalCode", typeof(string)),
                        ("Coordinates", typeof(byte[])),
                        ("CityName", typeof(string)),
                        ("StateProvinceId", typeof(Guid)),
                        ("StateProvinceName", typeof(string)),
                        ("ISO3166_2", typeof(string)),
                        ("CountryId", typeof(Guid)),
                        ("CountryName", typeof(string)),
                        ("ISO3166_1", typeof(string))
                    )
                    .AddRow(
                        breweryId,
                        Guid.NewGuid(),
                        "Renamed Brewery",
                        "Updated description",
                        DateTime.UtcNow,
                        DateTime.UtcNow,
                        newRowVersion,
                        Guid.NewGuid(),
                        Guid.NewGuid(),
                        "123 Main St",
                        null,
                        "12345",
                        null,
                        "Portland",
                        Guid.NewGuid(),
                        "Oregon",
                        "US-OR",
                        Guid.NewGuid(),
                        "United States",
                        "US"
                    )
            );

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new()
        {
            BreweryPostId = breweryId,
            PostedById = Guid.NewGuid(),
            BreweryName = "Renamed Brewery",
            Description = "Updated description",
            RowVersion = [0x00, 0x01],
            Location = new BreweryPostLocation
            {
                CityId = Guid.NewGuid(),
                AddressLine1 = "123 Main St",
                PostalCode = "12345",
            },
        };

        BreweryPost result = await repo.UpdateAsync(brewery);

        result.BreweryPostId.Should().Be(breweryId);
        result.RowVersion.Should().Equal(newRowVersion);
    }

    [Fact]
    public async Task UpdateAsync_ThrowsNotFound_WhenBreweryMissing()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd =>
                cmd.CommandText.Contains("SELECT 1 FROM dbo.BreweryPost WHERE BreweryPostID")
            )
            .ReturnsScalar((int?)null);

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new() { BreweryPostId = Guid.NewGuid(), RowVersion = [0x00, 0x01] };

        Func<Task> act = async () => await repo.UpdateAsync(brewery);
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task UpdateAsync_ThrowsConflict_WhenRowVersionStale()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd =>
                cmd.CommandText.Contains("SELECT 1 FROM dbo.BreweryPost WHERE BreweryPostID")
            )
            .ReturnsScalar(1);

        // Brewery exists but the conditional UPDATE (WHERE ... AND RowVersion = @RowVersion) matches no rows,
        // since the caller's RowVersion no longer matches the stored row.
        conn.Mocks.When(cmd =>
                cmd.CommandText.Contains("WHERE BreweryPostID = @BreweryPostId AND RowVersion = @RowVersion")
            )
            .ReturnsScalar(0);

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new()
        {
            BreweryPostId = Guid.NewGuid(),
            BreweryName = "Renamed Brewery",
            Description = "Updated description",
            RowVersion = [0x00, 0x01],
        };

        Func<Task> act = async () => await repo.UpdateAsync(brewery);
        await act.Should().ThrowAsync<ConflictException>();
    }
}
