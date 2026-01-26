using System.Data;
using System.Security.Cryptography;
using System.Text;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;
using idunno.Password;
using Konscious.Security.Cryptography;
using Microsoft.Data.SqlClient;

namespace DBSeed
{

    internal class UserSeeder : ISeeder
    {
        
        
        private static readonly IReadOnlyList<(
            string FirstName,
            string LastName
            )> SeedNames =
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

        public async Task SeedAsync(SqlConnection connection)
        {
            var generator = new PasswordGenerator();
            var rng = new Random();
            int createdUsers = 0;
            int createdCredentials = 0;
            int createdVerifications = 0;

            foreach (var (firstName, lastName) in SeedNames)
            {
               // create the user in the database
               var userAccountId = Guid.NewGuid();
               await AddUserAccountAsync(connection, new UserAccount
               {
                   UserAccountId = userAccountId,
                   FirstName = firstName,
                   LastName = lastName,
                   Email = $"{firstName}.{lastName}@thebiergarten.app",
                   Username = $"{firstName[0]}.{lastName}",
                   DateOfBirth = GenerateDateOfBirth(rng)
               });
               createdUsers++;

               // add user credentials
                if (!await HasUserCredentialAsync(connection, userAccountId))
                {
                    string pwd = generator.Generate(
                        length: 64,
                        numberOfDigits: 10,
                        numberOfSymbols: 10
                    );
                    string hash = GeneratePasswordHash(pwd);
                    await AddUserCredentialAsync(connection, userAccountId, hash);
                    createdCredentials++;
                }

                // add user verification
                if (await HasUserVerificationAsync(connection, userAccountId)) continue;
                await AddUserVerificationAsync(connection, userAccountId);
                createdVerifications++;
            }

            Console.WriteLine($"Created {createdUsers} user accounts.");
            Console.WriteLine($"Added {createdCredentials} user credentials.");
            Console.WriteLine($"Added {createdVerifications} user verifications.");
        }

        private static async Task AddUserAccountAsync(SqlConnection connection, UserAccount ua)
        {
            await using var command = new SqlCommand("usp_CreateUserAccount", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add("@UserAccountId", SqlDbType.UniqueIdentifier).Value = ua.UserAccountId;
            command.Parameters.Add("@Username", SqlDbType.NVarChar, 100).Value = ua.Username;
            command.Parameters.Add("@FirstName", SqlDbType.NVarChar, 100).Value = ua.FirstName;
            command.Parameters.Add("@LastName", SqlDbType.NVarChar, 100).Value = ua.LastName;
            command.Parameters.Add("@Email", SqlDbType.NVarChar, 256).Value = ua.Email;
            command.Parameters.Add("@DateOfBirth", SqlDbType.Date).Value = ua.DateOfBirth;

            await command.ExecuteNonQueryAsync();
        }

        private static string GeneratePasswordHash(string pwd)
        {
            byte[] salt = RandomNumberGenerator.GetBytes(16);

            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(pwd))
            {
                Salt = salt,
                DegreeOfParallelism = Math.Max(Environment.ProcessorCount, 1),
                MemorySize = 65536,
                Iterations = 4,
            };

            byte[] hash = argon2.GetBytes(32);
            return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
        }

        private static async Task<bool> HasUserCredentialAsync(
            SqlConnection connection,
            Guid userAccountId
        )
        {
            const string sql = $"""
                                SELECT 1
                                FROM dbo.UserCredential
                                WHERE UserAccountId = @UserAccountId;
                                """;
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@UserAccountId", userAccountId);
            object? result = await command.ExecuteScalarAsync();
            return result is not null;
        }

        private static async Task AddUserCredentialAsync(
            SqlConnection connection,
            Guid userAccountId,
            string hash
        )
        {
            await using var command = new SqlCommand(
                "dbo.USP_AddUserCredential",
                connection
            );
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@UserAccountId", userAccountId);
            command.Parameters.AddWithValue("@Hash", hash);

            await command.ExecuteNonQueryAsync();
        }

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
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@UserAccountId", userAccountId);
            var result = await command.ExecuteScalarAsync();
            return result is not null;
        }

        private static async Task AddUserVerificationAsync(
            SqlConnection connection,
            Guid userAccountId
        )
        {
            await using var command = new SqlCommand(
                "dbo.USP_CreateUserVerification",
                connection
            );
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@UserAccountID", userAccountId);

            await command.ExecuteNonQueryAsync();
        }
        
        private static DateTime GenerateDateOfBirth(Random random)
        {
            int age = 19 + random.Next(0, 30);
            DateTime baseDate = DateTime.UtcNow.Date.AddYears(-age);
            int offsetDays = random.Next(0, 365);
            return baseDate.AddDays(-offsetDays);
        }
    }
}