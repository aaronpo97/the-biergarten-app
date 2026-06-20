using System.Data;
using System.Security.Cryptography;
using System.Text;
using idunno.Password;
using Konscious.Security.Cryptography;
using Microsoft.Data.SqlClient;

namespace Database.Seed;

/// <summary>
///     Seeds user accounts, credentials, and verification records. Creates one fixed
///     "Test User" account (<c>test.user@thebiergarten.app</c> / password <c>"password"</c>)
///     for testing, followed by a randomly-generated account for each name in
///     <see cref="SeedNames" />, each with a random password and date of birth. Skips
///     adding a verification record for a user that already has one, so this seeder is
///     safe to re-run, though re-running will still attempt to register (and may fail on)
///     users that already exist.
/// </summary>
internal class UserSeeder : ISeeder
{
    /// <summary>The first/last name pairs used to generate seed user accounts.</summary>
    private static readonly IReadOnlyList<(string FirstName, string LastName)> SeedNames =
    [
        ("Aarya", "Mathews"),
        ("Aiden", "Wells"),
        ("Aleena", "Gonzalez"),
        ("Alessandra", "Nelson"),
        ("Amari", "Tucker"),
        ("Ameer", "Huff"),
        ("Amirah", "Hicks"),
        ("Analia", "Dominguez"),
        ("Anne", "Jenkins"),
        ("Apollo", "Davis"),
        ("Arianna", "White"),
        ("Aubree", "Moore"),
        ("Aubrielle", "Raymond"),
        ("Aydin", "Odom"),
        ("Bowen", "Casey"),
        ("Brock", "Huber"),
        ("Caiden", "Strong"),
        ("Cecilia", "Rosales"),
        ("Celeste", "Barber"),
        ("Chance", "Small"),
        ("Clara", "Roberts"),
        ("Collins", "Brandt"),
        ("Damir", "Wallace"),
        ("Declan", "Crawford"),
        ("Dennis", "Decker"),
        ("Dylan", "Lang"),
        ("Eliza", "Kane"),
        ("Elle", "Poole"),
        ("Elliott", "Miles"),
        ("Emelia", "Lucas"),
        ("Emilia", "Simpson"),
        ("Emmett", "Lugo"),
        ("Ethan", "Stephens"),
        ("Etta", "Woods"),
        ("Gael", "Moran"),
        ("Grant", "Benson"),
        ("Gwen", "James"),
        ("Huxley", "Chen"),
        ("Isabella", "Fisher"),
        ("Ivan", "Mathis"),
        ("Jamir", "McMillan"),
        ("Jaxson", "Shields"),
        ("Jimmy", "Richmond"),
        ("Josiah", "Flores"),
        ("Kaden", "Enriquez"),
        ("Kai", "Lawson"),
        ("Karsyn", "Adkins"),
        ("Karsyn", "Proctor"),
        ("Kayden", "Henson"),
        ("Kaylie", "Spears"),
        ("Kinslee", "Jones"),
        ("Kora", "Guerra"),
        ("Lane", "Skinner"),
        ("Laylani", "Christian"),
        ("Ledger", "Carroll"),
        ("Leilany", "Small"),
        ("Leland", "McCall"),
        ("Leonard", "Calhoun"),
        ("Levi", "Ochoa"),
        ("Lillie", "Vang"),
        ("Lola", "Sheppard"),
        ("Luciana", "Poole"),
        ("Maddox", "Hughes"),
        ("Mara", "Blackwell"),
        ("Marcellus", "Bartlett"),
        ("Margo", "Koch"),
        ("Maurice", "Gibson"),
        ("Maxton", "Dodson"),
        ("Mia", "Parrish"),
        ("Millie", "Fuentes"),
        ("Nellie", "Villanueva"),
        ("Nicolas", "Mata"),
        ("Nicolas", "Miller"),
        ("Oakleigh", "Foster"),
        ("Octavia", "Pierce"),
        ("Paisley", "Allison"),
        ("Quincy", "Andersen"),
        ("Quincy", "Frazier"),
        ("Raiden", "Roberts"),
        ("Raquel", "Lara"),
        ("Rudy", "McIntosh"),
        ("Salvador", "Stein"),
        ("Samantha", "Dickson"),
        ("Solomon", "Richards"),
        ("Sylvia", "Hanna"),
        ("Talia", "Trujillo"),
        ("Thalia", "Farrell"),
        ("Trent", "Mayo"),
        ("Trinity", "Cummings"),
        ("Ty", "Perry"),
        ("Tyler", "Romero"),
        ("Valeria", "Pierce"),
        ("Vance", "Neal"),
        ("Whitney", "Bell"),
        ("Wilder", "Graves"),
        ("William", "Logan"),
        ("Zara", "Wilkinson"),
        ("Zaria", "Gibson"),
        ("Zion", "Watkins"),
        ("Zoie", "Armstrong"),
    ];

    /// <summary>
    ///     Registers a fixed test user account followed by one randomly-generated account
    ///     per entry in <see cref="SeedNames" />, adding a user verification record for each
    ///     newly created account that does not already have one. Progress counts are
    ///     written to the console on completion.
    /// </summary>
    /// <param name="connection">An open connection to the target database.</param>
    /// <returns>A task that completes when all users have been seeded.</returns>
    public async Task SeedAsync(SqlConnection connection)
    {
        PasswordGenerator generator = new();
        Random rng = new();
        int createdUsers = 0;
        int createdCredentials = 0;
        int createdVerifications = 0;

        // create a known user for testing purposes
        {
            const string firstName = "Test";
            const string lastName = "User";
            const string email = "test.user@thebiergarten.app";
            DateTime dob = new(1985, 03, 01);
            string hash = GeneratePasswordHash("password");

            await RegisterUserAsync(
                connection,
                $"{firstName}.{lastName}",
                firstName,
                lastName,
                dob,
                email,
                hash
            );
        }
        foreach ((string firstName, string lastName) in SeedNames)
        {
            // prepare user fields
            string username = $"{firstName[0]}.{lastName}";
            string email = $"{firstName}.{lastName}@thebiergarten.app";
            DateTime dob = GenerateDateOfBirth(rng);

            // generate a password and hash it
            string pwd = generator.Generate(64, 10, 10);
            string hash = GeneratePasswordHash(pwd);

            // register the user (creates account + credential)
            Guid id = await RegisterUserAsync(
                connection,
                username,
                firstName,
                lastName,
                dob,
                email,
                hash
            );
            createdUsers++;
            createdCredentials++;

            // add user verification
            if (await HasUserVerificationAsync(connection, id))
                continue;

            await AddUserVerificationAsync(connection, id);
            createdVerifications++;
        }

        Console.WriteLine($"Created {createdUsers} user accounts.");
        Console.WriteLine($"Added {createdCredentials} user credentials.");
        Console.WriteLine($"Added {createdVerifications} user verifications.");
    }

    /// <summary>
    ///     Registers a new user account and its credential by invoking the
    ///     <c>dbo.USP_RegisterUser</c> stored procedure.
    /// </summary>
    /// <param name="connection">An open connection to the target database.</param>
    /// <param name="username">The unique username for the account.</param>
    /// <param name="firstName">The user's first name.</param>
    /// <param name="lastName">The user's last name.</param>
    /// <param name="dateOfBirth">The user's date of birth.</param>
    /// <param name="email">The user's email address.</param>
    /// <param name="hash">The salted password hash, as produced by <see cref="GeneratePasswordHash" />.</param>
    /// <returns>The newly created user account's <see cref="Guid" /> identifier.</returns>
    private static async Task<Guid> RegisterUserAsync(
        SqlConnection connection,
        string username,
        string firstName,
        string lastName,
        DateTime dateOfBirth,
        string email,
        string hash
    )
    {
        await using SqlCommand command = new("dbo.USP_RegisterUser", connection);
        command.CommandType = CommandType.StoredProcedure;

        command.Parameters.Add("@Username", SqlDbType.VarChar, 64).Value = username;
        command.Parameters.Add("@FirstName", SqlDbType.NVarChar, 128).Value = firstName;
        command.Parameters.Add("@LastName", SqlDbType.NVarChar, 128).Value = lastName;
        command.Parameters.Add("@DateOfBirth", SqlDbType.DateTime).Value = dateOfBirth;
        command.Parameters.Add("@Email", SqlDbType.VarChar, 128).Value = email;
        command.Parameters.Add("@Hash", SqlDbType.NVarChar, -1).Value = hash;

        object? result = await command.ExecuteScalarAsync();

        return (Guid)result!;
    }

    /// <summary>
    ///     Hashes a plaintext password using Argon2id with a randomly generated 16-byte
    ///     salt, a degree of parallelism matching the available processor count, 64 MB of
    ///     memory, and 4 iterations.
    /// </summary>
    /// <param name="pwd">The plaintext password to hash.</param>
    /// <returns>A string containing the base64-encoded salt and hash, separated by a colon.</returns>
    private static string GeneratePasswordHash(string pwd)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(16);

        Argon2id argon2 = new(Encoding.UTF8.GetBytes(pwd))
        {
            Salt = salt,
            DegreeOfParallelism = Math.Max(Environment.ProcessorCount, 1),
            MemorySize = 65536,
            Iterations = 4,
        };

        byte[] hash = argon2.GetBytes(32);
        return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    /// <summary>Checks whether a user verification record already exists for the given user account.</summary>
    /// <param name="connection">An open connection to the target database.</param>
    /// <param name="userAccountId">The user account identifier to check.</param>
    /// <returns><c>true</c> if a verification record already exists; otherwise <c>false</c>.</returns>
    private static async Task<bool> HasUserVerificationAsync(
        SqlConnection connection,
        Guid userAccountId
    )
    {
        const string sql = """
            SELECT 1
            FROM dbo.UserVerification
            WHERE UserAccountId = @UserAccountId;
            """;
        await using SqlCommand command = new(sql, connection);
        command.Parameters.AddWithValue("@UserAccountId", userAccountId);
        object? result = await command.ExecuteScalarAsync();
        return result is not null;
    }

    /// <summary>Creates a user verification record by invoking the <c>dbo.USP_CreateUserVerification</c> stored procedure.</summary>
    /// <param name="connection">An open connection to the target database.</param>
    /// <param name="userAccountId">The identifier of the user account to verify.</param>
    /// <returns>A task that completes when the verification record has been created.</returns>
    private static async Task AddUserVerificationAsync(SqlConnection connection, Guid userAccountId)
    {
        await using SqlCommand command = new("dbo.USP_CreateUserVerification", connection);
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.AddWithValue("@UserAccountID_", userAccountId);

        await command.ExecuteNonQueryAsync();
    }

    /// <summary>
    ///     Generates a random date of birth corresponding to an age between 19 and 48
    ///     years (inclusive), with a random day offset within that birth year.
    /// </summary>
    /// <param name="random">The random number source to use.</param>
    /// <returns>A randomly generated date of birth.</returns>
    private static DateTime GenerateDateOfBirth(Random random)
    {
        int age = 19 + random.Next(0, 30);
        DateTime baseDate = DateTime.UtcNow.Date.AddYears(-age);
        int offsetDays = random.Next(0, 365);
        return baseDate.AddDays(-offsetDays);
    }
}
