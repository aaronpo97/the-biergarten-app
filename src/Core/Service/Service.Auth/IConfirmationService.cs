using Domain.Exceptions;
using Infrastructure.Repository.Auth;

namespace Service.Auth;

public record ConfirmationServiceReturn(DateTime ConfirmedAt, Guid UserId);

public interface IConfirmationService
{
    Task<ConfirmationServiceReturn> ConfirmUserAsync(string confirmationToken);
}
