using MediatR;

namespace Features.Auth.Commands.UpdateBiography;

/// <summary>Updates the biography of the given user account's profile.</summary>
/// <param name="UserAccountId">
///     The authenticated caller's own ID, extracted from the access token -- never bind this from
///     client-supplied input.
/// </param>
public record UpdateBiographyCommand(Guid UserAccountId, string Biography) : IRequest;
