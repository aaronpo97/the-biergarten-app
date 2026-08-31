using MediatR;

namespace Features.Auth.Commands.Account.DeleteAccount;

/// <summary>Permanently deletes the given user account.</summary>
/// <param name="UserAccountId">
///     The authenticated caller's own ID, extracted from the access token -- never bind this from
///     client-supplied input.
/// </param>
public record DeleteAccountCommand(Guid UserAccountId) : IRequest;
