using Domain.Entities;
using MediatR;

namespace Features.UserManagement.Commands.UpdateUser;

/// <summary>
/// Updates an existing user account. Not currently exposed via any HTTP route, carried forward
/// from <c>IUserService.UpdateAsync</c> as-is.
/// </summary>
public record UpdateUserCommand(UserAccount UserAccount) : IRequest;
