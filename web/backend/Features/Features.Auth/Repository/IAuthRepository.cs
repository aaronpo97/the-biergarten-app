using Domain.Entities;
using Features.Auth.Dtos;

namespace Features.Auth.Repository;

/// <summary>
///     Repository for authentication-related database operations including user registration and credential management.
/// </summary>
public interface IAuthRepository
{
    Task<UserAccount> RegisterUserAsync(UserRegistrationDto userRegistrationDto);

    Task<UserAccount?> GetUserByEmailAsync(string email);

    Task<UserAccount?> GetUserByUsernameAsync(string username);

    Task<UserCredential?> GetActiveCredentialByUserAccountIdAsync(Guid userAccountId);

    /// <summary>Rotates a user's credential by invalidating all existing credentials and creating a new one.</summary>
    Task RotateCredentialAsync(Guid userAccountId, string newPasswordHash);

    /// <summary>Marks a user account as confirmed. Idempotent if the account is already verified.</summary>
    Task<UserAccount?> ConfirmUserAccountAsync(Guid userAccountId);

    Task<UserAccount?> GetUserByIdAsync(Guid userAccountId);

    Task<bool> IsUserVerifiedAsync(Guid userAccountId);
}
