using MediatR;

namespace Shared.Application.Emails;

/// <summary>
///     Cross-slice command sent by Features.Auth and handled by Features.Emails to dispatch a
///     fresh confirmation-link email, without either slice taking a project reference on the other.
/// </summary>
public record SendResendConfirmationEmailCommand(
    string FirstName,
    string Email,
    string ConfirmationToken
) : IRequest;
