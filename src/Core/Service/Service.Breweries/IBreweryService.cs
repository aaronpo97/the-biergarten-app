using API.Core.Contracts.Breweries;
using Domain.Entities;

namespace Service.Breweries;

public interface IBreweryService
{
   Task<BreweryPost?> GetByIdAsync(Guid id);
   Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit = null, int? offset = null);
   Task<BreweryServiceReturn> CreateAsync(BreweryCreateDto brewery);
   Task<BreweryServiceReturn> UpdateAsync(BreweryDto brewery);
   Task DeleteAsync(Guid id);
}

public record BreweryServiceReturn
{
   public bool Success { get; init; } = false;
   public BreweryPost Brewery { get; init; }
   public string Message { get; init; } = string.Empty;

   public BreweryServiceReturn(BreweryPost brewery)
   {
      Success = true;
      Brewery = brewery;
   }

   public BreweryServiceReturn(string message)
   {
      Success = false;
      Brewery = default!;
      Message = message;
   }
}
