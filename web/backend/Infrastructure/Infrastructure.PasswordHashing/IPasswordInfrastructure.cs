namespace Infrastructure.PasswordHashing;

/// <summary>
/// Service for hashing and verifying user passwords.
/// </summary>
public interface IPasswordInfrastructure
{
    /// <summary>
    /// Hashes a plaintext password, generating a new random salt.
    /// </summary>
    /// <param name="password">The plaintext password to hash.</param>
    /// <returns>A string encoding both the salt and the resulting hash, suitable for storage.</returns>
    public string Hash(string password);

    /// <summary>
    /// Verifies a plaintext password against a previously stored hash.
    /// </summary>
    /// <param name="password">The plaintext password to verify.</param>
    /// <param name="stored">The stored salt/hash string previously produced by <see cref="Hash"/>.</param>
    /// <returns><c>true</c> if the password matches the stored hash; otherwise <c>false</c>.</returns>
    public bool Verify(string password, string stored);
}
