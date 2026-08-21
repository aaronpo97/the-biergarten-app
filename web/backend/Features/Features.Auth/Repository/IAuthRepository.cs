using Domain.Entities;
using Features.Auth.Dtos;

namespace Features.Auth.Repository;

/// <summary>
///     Repository for authentication-related database operations including user registration and credential management.
/// </summary>
public interface IAuthRepository
{
    /// <summary>
    ///     Registers a new user account and its initial credential as a single atomic operation, then
    ///     returns the created account.
    /// </summary>
    /// <exception cref="Exception">Thrown when the newly registered user cannot be retrieved after registration.</exception>
    Task<UserAccount> RegisterUserAsync(UserAccount ua);

    /// <summary>Retrieves a user account by email, or <see langword="null" /> if none exists.</summary>
    Task<UserAccount?> GetUserByEmailAsync(string email);

    /// <summary>Retrieves a user account by username, or <see langword="null" /> if none exists.</summary>
    Task<UserAccount?> GetUserByUsernameAsync(string username);

    /// <summary>Retrieves the active (non-revoked) credential for a user account, or <see langword="null" /> if none exists.</summary>
    Task<UserCredential?> GetActiveCredentialByUserAccountIdAsync(Guid userAccountId);

    /// <summary>Rotates a user's credential by invalidating all existing credentials and creating a new one.</summary>
    /// <exception cref="Domain.Exceptions.NotFoundException">Thrown when no account with <paramref name="userAccountId" /> exists.</exception>
    Task RotateCredentialAsync(Guid userAccountId, string newPasswordHash);

    /// <summary>Marks a user account as confirmed. Idempotent if the account is already verified.</summary>
    Task<UserAccount?> ConfirmUserAccountAsync(Guid userAccountId);

    /// <summary>Retrieves a user account by ID, or <see langword="null" /> if none exists.</summary>
    Task<UserAccount?> GetUserByIdAsync(Guid userAccountId);

    /// <summary>Determines whether a user account has been verified.</summary>
    Task<bool> IsUserVerifiedAsync(Guid userAccountId);
}
