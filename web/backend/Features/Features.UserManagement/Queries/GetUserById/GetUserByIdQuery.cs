using Domain.Entities;
using MediatR;

namespace Features.UserManagement.Queries.GetUserById;

public record GetUserByIdQuery(Guid UserAccountId) : IRequest<UserAccount>;
