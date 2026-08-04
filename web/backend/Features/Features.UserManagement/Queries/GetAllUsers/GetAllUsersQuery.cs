using Domain.Entities;
using MediatR;

namespace Features.UserManagement.Queries.GetAllUsers;

public record GetAllUsersQuery(int? Limit, int? Offset) : IRequest<IEnumerable<UserAccount>>;
