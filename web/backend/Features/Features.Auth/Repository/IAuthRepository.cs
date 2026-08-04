using Domain.Entities;
using Features.Auth.Dtos;

namespace Features.Auth.Repository;
/// <summary>
///     Repository for authentication-related database operations including user registration and credential management.
/// </summary>
public interface IAuthRepository
{
    /// <summary>
    ///     Registers a new user with account details and initial credential.
    ///     Uses stored procedure: USP_RegisterUser
    /// </summary>
    Task<UserAccount> RegisterUserAsync(
        UserRegistrationDto userRegistrationDto
    );

    /// <summary>
    ///     Retrieves a user account by email address (typically used for login).
    ///     Uses stored procedure: usp_GetUserAccountByEmail
    /// </summary>
    /// <param name="email">Email address to search for</param>
    /// <returns>UserAccount if found, null otherwise</returns>
    Task<UserAccount?> GetUserByEmailAsync(string email);

    /// <summary>
    ///     Retrieves a user account by username (typically used for login).
    ///     Uses stored procedure: usp_GetUserAccountByUsername
    /// </summary>
    /// <param name="username">Username to search for</param>
    /// <returns>UserAccount if found, null otherwise</returns>
    Task<UserAccount?> GetUserByUsernameAsync(string username);

    /// <summary>
    ///     Retrieves the active (non-revoked) credential for a user account.
    ///     Uses stored procedure: USP_GetActiveUserCredentialByUserAccountId
    /// </summary>
    /// <param name="userAccountId">ID of the user account</param>
    /// <returns>Active UserCredential if found, null otherwise</returns>
    Task<UserCredential?> GetActiveCredentialByUserAccountIdAsync(Guid userAccountId);

    /// <summary>
    ///     Rotates a user's credential by invalidating all existing credentials and creating a new one.
    ///     Uses stored procedure: USP_RotateUserCredential
    /// </summary>
    /// <param name="userAccountId">ID of the user account</param>
    /// <param name="newPasswordHash">New hashed password</param>
    Task RotateCredentialAsync(Guid userAccountId, string newPasswordHash);

    /// <summary>
    ///     Marks a user account as confirmed.
    /// </summary>
    /// <param name="userAccountId">ID of the user account to confirm</param>
    /// <returns>The confirmed UserAccount entity, or null if the user account does not exist</returns>
    Task<UserAccount?> ConfirmUserAccountAsync(Guid userAccountId);

    /// <summary>
    ///     Retrieves a user account by ID.
    /// </summary>
    /// <param name="userAccountId">ID of the user account</param>
    /// <returns>UserAccount if found, null otherwise</returns>
    Task<UserAccount?> GetUserByIdAsync(Guid userAccountId);

    /// <summary>
    ///     Checks whether a user account has been verified.
    /// </summary>
    /// <param name="userAccountId">ID of the user account</param>
    /// <returns>True if the user has a verification record, false otherwise</returns>
    Task<bool> IsUserVerifiedAsync(Guid userAccountId);
}
