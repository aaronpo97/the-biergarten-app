using Domain.Entities;
using MediatR;

namespace Features.Users.Queries.GetUserById;

/// <param name="UserAccountId">The account to fetch.</param>
/// <param name="RequestingUserId">
/// The authenticated caller's ID, from the access token. It must equal
/// <paramref name="UserAccountId" />. This query returns private fields, including <c>Email</c>.
/// </param>
public record GetUserByIdQuery(Guid UserAccountId, Guid RequestingUserId) : IRequest<UserAccount>;
