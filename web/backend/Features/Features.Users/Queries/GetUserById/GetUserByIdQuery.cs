using Domain.Entities;
using MediatR;

namespace Features.Auth.Queries.GetUserById;

public record GetUserByIdQuery(Guid UserAccountId) : IRequest<UserAccount>;
