using Features.Locations.Dtos;
using MediatR;

namespace Features.Locations.Commands.GetOrCreateCity;

/// <summary>
///     Resolves <see cref="City" /> to a City ID, creating the Country, StateProvince, and/or City rows
///     if any part of the chain doesn't exist yet. Sent by other features' handlers (e.g. brewery
///     creation) rather than bound from a request directly, since this feature exposes no controller of
///     its own.
/// </summary>
public record GetOrCreateCityCommand(CityLocation City) : IRequest<Guid>;
