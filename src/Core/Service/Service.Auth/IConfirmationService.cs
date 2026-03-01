using System.Runtime.InteropServices.JavaScript;
using Infrastructure.Repository.Auth;

namespace Service.Auth;

public record ConfirmationServiceReturn(DateTime ConfirmedAt, Guid UserId);

public interface IConfirmationService
{
    Task<ConfirmationServiceReturn> ConfirmUserAsync(string confirmationToken);
}

public class ConfirmationService(IAuthRepository authRepository, ITokenService tokenService)
    : IConfirmationService
{

    public async Task<ConfirmationServiceReturn> ConfirmUserAsync(
        string confirmationToken
    )
    {
        return new ConfirmationServiceReturn(DateTime.Now, Guid.NewGuid());
    }
}
