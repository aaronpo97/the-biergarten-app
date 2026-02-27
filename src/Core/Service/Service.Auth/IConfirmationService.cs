using System.Runtime.InteropServices.JavaScript;
using Infrastructure.Repository.Auth;

namespace Service.Auth;

public record ConfirmationServiceReturn(DateTime confirmedAt, Guid userId);

public interface IConfirmationService
{
    Task<ConfirmationServiceReturn> ConfirmUserAsync(string confirmationToken);
}

public class ConfirmationService(IAuthRepository authRepository)
    : IConfirmationService
{
    public async Task<ConfirmationServiceReturn> ConfirmUserAsync(
        string confirmationToken
    )
    {
        return new ConfirmationServiceReturn(DateTime.Now, Guid.NewGuid());
    }
}
