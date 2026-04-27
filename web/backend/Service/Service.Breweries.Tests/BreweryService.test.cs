using FluentAssertions;
using Xunit;
using Service.Breweries;
using API.Core.Contracts.Breweries;
using Domain.Entities;

namespace Service.Breweries.Tests;

public class BreweryServiceTests
{
   private class FakeRepo : IBreweryRepository
   {
      public BreweryPost? Created;

      public Task<BreweryPost?> GetByIdAsync(Guid id) => Task.FromResult<BreweryPost?>(null);
      public Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit, int? offset) => Task.FromResult<IEnumerable<BreweryPost>>(Array.Empty<BreweryPost>());
      public Task UpdateAsync(BreweryPost brewery) { Created = brewery; return Task.CompletedTask; }
      public Task DeleteAsync(Guid id) => Task.CompletedTask;
      public Task CreateAsync(BreweryPost brewery) { Created = brewery; return Task.CompletedTask; }
   }

   [Fact]
   public async Task CreateAsync_ReturnsFailure_WhenLocationMissing()
   {
      var repo = new FakeRepo();
      var svc = new BreweryService(repo);

      var dto = new BreweryCreateDto
      {
         PostedById = Guid.NewGuid(),
         BreweryName = "X",
         Description = "Y",
         Location = null!
      };

      var result = await svc.CreateAsync(dto);
      result.Success.Should().BeFalse();
      result.Message.Should().Contain("Location");
   }

   [Fact]
   public async Task CreateAsync_ReturnsSuccess_AndPersistsEntity()
   {
      var repo = new FakeRepo();
      var svc = new BreweryService(repo);

      var loc = new BreweryLocationCreateDto
      {
         CityId = Guid.NewGuid(),
         AddressLine1 = "123 Main",
         PostalCode = "12345"
      };

      var dto = new BreweryCreateDto
      {
         PostedById = Guid.NewGuid(),
         BreweryName = "MyBrew",
         Description = "Desc",
         Location = loc
      };

      var result = await svc.CreateAsync(dto);

      result.Success.Should().BeTrue();
      repo.Created.Should().NotBeNull();
      repo.Created!.BreweryName.Should().Be("MyBrew");
      result.Brewery.BreweryName.Should().Be("MyBrew");
   }
}
