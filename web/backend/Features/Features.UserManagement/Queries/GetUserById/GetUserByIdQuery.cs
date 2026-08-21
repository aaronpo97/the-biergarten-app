using Domain.Entities;
using MediatR;

namespace Features.UserManagement.Queries.GetUserById;

/// <summary>
///     Requests the user account with the given ID.
/// </summary>
public record GetUserByIdQuery(Guid UserAccountId) : IRequest<UserAccount>;
