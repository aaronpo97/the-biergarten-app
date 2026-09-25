using Domain.Entities;
using MediatR;

namespace Features.Users.Queries.GetUserById;

/// <param name="UserAccountId">
/// The account to fetch. This query returns private fields, including <c>Email</c>.
/// </param>
public record GetUserByIdQuery(Guid UserAccountId) : IRequest<UserAccount>;
