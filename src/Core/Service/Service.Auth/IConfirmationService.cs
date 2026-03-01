using System.Runtime.InteropServices.JavaScript;
using Domain.Exceptions;
using Infrastructure.Repository.Auth;

namespace Service.Auth;

public record ConfirmationServiceReturn(DateTime confirmedAt, Guid userId);

public interface IConfirmationService
{
    Task<ConfirmationServiceReturn> ConfirmUserAsync(string confirmationToken);
}

public class ConfirmationService(
    IAuthRepository authRepository,
    ITokenService tokenService
) : IConfirmationService
{
    private readonly IAuthRepository _authRepository = authRepository;
    private readonly ITokenService _tokenService = tokenService;

    public async Task<ConfirmationServiceReturn> ConfirmUserAsync(
        string confirmationToken
    )
    {
        // Validate the confirmation token
        var validatedToken =
            await _tokenService.ValidateConfirmationTokenAsync(
                confirmationToken
            );

        // Confirm the user account
        var user = await _authRepository.ConfirmUserAccountAsync(
            validatedToken.UserId
        );

        if (user == null)
        {
            throw new UnauthorizedException(
                "User account not found"
            );
        }

        // Return the confirmation result
        return new ConfirmationServiceReturn(DateTime.UtcNow, validatedToken.UserId);
    }
}
