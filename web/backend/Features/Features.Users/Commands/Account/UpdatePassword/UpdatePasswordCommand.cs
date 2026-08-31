using Features.Auth.Dtos;
using MediatR;

namespace Features.Auth.Commands.Account.UpdatePassword;

/// <summary>Changes the password of the given user account, verifying the current password first.</summary>
/// <param name="UserAccountId">
///     The authenticated caller's own ID, extracted from the access token -- never bind this from
///     client-supplied input.
/// </param>
public record UpdatePasswordCommand(Guid UserAccountId, string CurrentPassword, string NewPassword)
    : IRequest<UpdatePasswordPayload>;
