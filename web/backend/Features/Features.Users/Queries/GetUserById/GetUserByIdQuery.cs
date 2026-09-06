using Domain.Entities;
using MediatR;

namespace Features.Users.Queries.GetUserById;

public record GetUserByIdQuery(Guid UserAccountId) : IRequest<UserAccount>;
