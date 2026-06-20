using Domain.Entities;
using MediatR;

namespace Features.UserManagement.Queries.GetUserById;

/// <summary>
///     Retrieves a single user account by its unique identifier.
/// </summary>
public record GetUserByIdQuery(Guid UserAccountId) : IRequest<UserAccount>;