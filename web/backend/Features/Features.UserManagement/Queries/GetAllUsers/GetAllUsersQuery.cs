using Domain.Entities;
using MediatR;

namespace Features.UserManagement.Queries.GetAllUsers;

/// <summary>
///     Retrieves a paginated list of user accounts.
/// </summary>
public record GetAllUsersQuery(int? Limit, int? Offset) : IRequest<IEnumerable<UserAccount>>;