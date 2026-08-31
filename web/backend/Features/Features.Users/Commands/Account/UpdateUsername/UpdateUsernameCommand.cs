using Features.Auth.Dtos;
using MediatR;

namespace Features.Auth.Commands.Account.UpdateUsername;

/// <summary>Changes the username of the given user account.</summary>
/// <param name="UserAccountId">
///     The authenticated caller's own ID, extracted from the access token -- never bind this from
///     client-supplied input.
/// </param>
public record UpdateUsernameCommand(Guid UserAccountId, string NewUsername)
    : IRequest<UpdateUsernamePayload>;
