using Features.Users.Dtos;
using MediatR;

namespace Features.Users.Queries.GetPublicUserProfileById;

public record GetPublicUserProfileByIdQuery(Guid UserAccountId) : IRequest<PublicUserProfileDto>;
