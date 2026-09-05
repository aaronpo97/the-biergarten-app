using MediatR;

namespace Features.Locations.Commands.CreateStateProvince;

public record CreateStateProvinceCommand(string StateProvinceName, string IsoCode, Guid CountryId)
    : IRequest<Guid>;
