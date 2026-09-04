using MediatR;

namespace Features.Locations.Queries.GetStateProvince;

public record GetStateProvinceQuery(string IsoCode) : IRequest<Guid?>;
