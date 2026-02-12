using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;

namespace Infrastructure.PasswordHashing;

public class Argon2Infrastructure : IPasswordInfra
{
    private const int SaltSize = 16; // 128-bit
    private const int HashSize = 32; // 256-bit
    private const int ArgonIterations = 4;
    private const int ArgonMemoryKb = 65536; // 64MB

    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
        {
            Salt = salt,
            DegreeOfParallelism = Math.Max(Environment.ProcessorCount, 1),
            MemorySize = ArgonMemoryKb,
            Iterations = ArgonIterations,
        };

        var hash = argon2.GetBytes(HashSize);
        return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    public bool Verify(string password, string stored)
    {
        try
        {
            var parts = stored.Split(
                ':',
                StringSplitOptions.RemoveEmptyEntries
            );
            if (parts.Length != 2)
                return false;

            var salt = Convert.FromBase64String(parts[0]);
            var expected = Convert.FromBase64String(parts[1]);

            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = Math.Max(Environment.ProcessorCount, 1),
                MemorySize = ArgonMemoryKb,
                Iterations = ArgonIterations,
            };

            var actual = argon2.GetBytes(expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch
        {
            return false;
        }
    }
}
