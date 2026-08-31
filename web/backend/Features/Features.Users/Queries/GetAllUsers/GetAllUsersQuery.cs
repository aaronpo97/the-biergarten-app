using Domain.Entities;
using MediatR;

namespace Features.Auth.Queries.GetAllUsers;

/// <summary>
///     Requests a page of user accounts, ordered by creation date descending.
/// </summary>
/// <param name="Limit"><c>null</c> for no limit.</param>
/// <param name="Offset"><c>null</c> for no offset.</param>
public record GetAllUsersQuery(int? Limit, int? Offset) : IRequest<IEnumerable<UserAccount>>;
