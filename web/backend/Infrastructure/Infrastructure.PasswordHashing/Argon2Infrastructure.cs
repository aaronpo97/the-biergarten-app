using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;

namespace Infrastructure.PasswordHashing;

/// <summary>
///     Hashes and verifies passwords using the Argon2id algorithm via Konscious.Security.Cryptography.
/// </summary>
public class Argon2Infrastructure : IPasswordInfrastructure
{
    private const int SaltSize = 16; // 128-bit
    private const int HashSize = 32; // 256-bit
    private const int ArgonIterations = 4;
    private const int ArgonMemoryKb = 65536; // 64MB

    /// <summary>
    ///     Hashes a plaintext password using Argon2id with a newly generated 128-bit cryptographically
    ///     random salt, 4 iterations, 64MB of memory, and a degree of parallelism equal to the number of
    ///     available processors (minimum 1).
    /// </summary>
    /// <param name="password">The plaintext password to hash.</param>
    /// <returns>
    ///     A string of the form <c>"{base64Salt}:{base64Hash}"</c> containing the salt and the resulting
    ///     256-bit hash, suitable for storage and later verification.
    /// </returns>
    public string Hash(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);
        Argon2id argon2 = new(Encoding.UTF8.GetBytes(password))
        {
            Salt = salt,
            DegreeOfParallelism = Math.Max(Environment.ProcessorCount, 1),
            MemorySize = ArgonMemoryKb,
            Iterations = ArgonIterations
        };

        byte[] hash = argon2.GetBytes(HashSize);
        return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    /// <summary>
    ///     Verifies a plaintext password against a stored salt/hash string by recomputing the Argon2id
    ///     hash with the extracted salt and comparing it to the stored hash using a fixed-time comparison
    ///     to mitigate timing attacks.
    /// </summary>
    /// <param name="password">The plaintext password to verify.</param>
    /// <param name="stored">
    ///     The stored string of the form <c>"{base64Salt}:{base64Hash}"</c> previously produced by <see cref="Hash" />.
    /// </param>
    /// <returns>
    ///     <c>true</c> if the password matches the stored hash; <c>false</c> if it does not match, the stored
    ///     string is malformed (e.g. not in the expected two-part format, or not valid base64), or any other
    ///     error occurs while verifying.
    /// </returns>
    public bool Verify(string password, string stored)
    {
        try
        {
            string[] parts = stored.Split(
                ':',
                StringSplitOptions.RemoveEmptyEntries
            );
            if (parts.Length != 2)
                return false;

            byte[] salt = Convert.FromBase64String(parts[0]);
            byte[] expected = Convert.FromBase64String(parts[1]);

            Argon2id argon2 = new(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = Math.Max(Environment.ProcessorCount, 1),
                MemorySize = ArgonMemoryKb,
                Iterations = ArgonIterations
            };

            byte[] actual = argon2.GetBytes(expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch
        {
            return false;
        }
    }
}