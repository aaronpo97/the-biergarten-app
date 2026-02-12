using Domain.Core.Entities;

namespace Repository.Core.Repositories.Auth
{
    /// <summary>
    /// Repository for authentication-related database operations including user registration and credential management.
    /// </summary>
    public interface IAuthRepository
    {
        /// <summary>
        /// Registers a new user with account details and initial credential.
        /// Uses stored procedure: USP_RegisterUser
        /// </summary>
        /// <param name="username">Unique username for the user</param>
        /// <param name="firstName">User's first name</param>
        /// <param name="lastName">User's last name</param>
        /// <param name="email">User's email address</param>
        /// <param name="dateOfBirth">User's date of birth</param>
        /// <param name="passwordHash">Hashed password</param>
        /// <returns>The newly created UserAccount with generated ID</returns>
        Task<Domain.Core.Entities.UserAccount> RegisterUserAsync(
            string username,
            string firstName,
            string lastName,
            string email,
            DateTime dateOfBirth,
            string passwordHash
        );

        /// <summary>
        /// Retrieves a user account by email address (typically used for login).
        /// Uses stored procedure: usp_GetUserAccountByEmail
        /// </summary>
        /// <param name="email">Email address to search for</param>
        /// <returns>UserAccount if found, null otherwise</returns>
        Task<Domain.Core.Entities.UserAccount?> GetUserByEmailAsync(
            string email
        );

        /// <summary>
        /// Retrieves a user account by username (typically used for login).
        /// Uses stored procedure: usp_GetUserAccountByUsername
        /// </summary>
        /// <param name="username">Username to search for</param>
        /// <returns>UserAccount if found, null otherwise</returns>
        Task<Domain.Core.Entities.UserAccount?> GetUserByUsernameAsync(
            string username
        );

        /// <summary>
        /// Retrieves the active (non-revoked) credential for a user account.
        /// Uses stored procedure: USP_GetActiveUserCredentialByUserAccountId
        /// </summary>
        /// <param name="userAccountId">ID of the user account</param>
        /// <returns>Active UserCredential if found, null otherwise</returns>
        Task<UserCredential?> GetActiveCredentialByUserAccountIdAsync(
            Guid userAccountId
        );

        /// <summary>
        /// Rotates a user's credential by invalidating all existing credentials and creating a new one.
        /// Uses stored procedure: USP_RotateUserCredential
        /// </summary>
        /// <param name="userAccountId">ID of the user account</param>
        /// <param name="newPasswordHash">New hashed password</param>
        Task RotateCredentialAsync(Guid userAccountId, string newPasswordHash);
    }
}
