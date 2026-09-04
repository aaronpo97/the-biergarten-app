using MediatR;

namespace Features.Locations.Commands.CreateCity;

public record CreateCityCommand(string CityName, Guid StateProvinceId) : IRequest<Guid>;
