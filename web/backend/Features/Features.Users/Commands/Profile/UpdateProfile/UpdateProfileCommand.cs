using Features.Users.Dtos;
using MediatR;

namespace Features.Users.Commands.Profile.UpdateProfile;

/// <summary>
///     Updates the non-credential profile fields (first name, last name, date of birth) of the given
///     user account.
/// </summary>
/// <param name="UserAccountId">
///     The authenticated caller's own ID, extracted from the access token -- never bind this from
///     client-supplied input.
/// </param>
public record UpdateProfileCommand(
    Guid UserAccountId,
    string FirstName,
    string LastName,
    DateTime DateOfBirth
) : IRequest<UpdateProfilePayload>;
