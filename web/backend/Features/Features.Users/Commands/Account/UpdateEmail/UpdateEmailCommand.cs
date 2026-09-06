using Features.Users.Dtos;
using MediatR;

namespace Features.Users.Commands.Account.UpdateEmail;

/// <summary>
///     Changes the email address of the given user account. The account's <c>EmailConfirmed</c> status
///     is reset to unconfirmed as a result.
/// </summary>
/// <param name="UserAccountId">
///     The authenticated caller's own ID, extracted from the access token -- never bind this from
///     client-supplied input.
/// </param>
public record UpdateEmailCommand(Guid UserAccountId, string NewEmail)
    : IRequest<UpdateEmailPayload>;
