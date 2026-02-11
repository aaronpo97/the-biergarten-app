using System.Data;
using System.Security.Cryptography;
using System.Text;
using Repository.Core.Entities;
using Repository.Core.Repositories;
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

            {
                const string firstName = "Test";
                const string lastName = "User";
                const string email = "test.user@thebiergarten.app";
                var dob = new DateTime(1985, 03, 01);
                var hash = GeneratePasswordHash("password");

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
            foreach (var (firstName, lastName) in SeedNames)
            {
                // prepare user fields
                var username = $"{firstName[0]}.{lastName}";
                var email = $"{firstName}.{lastName}@thebiergarten.app";
                var dob = GenerateDateOfBirth(rng);

                // generate a password and hash it
                string pwd = generator.Generate(
                    length: 64,
                    numberOfDigits: 10,
                    numberOfSymbols: 10
                );
                string hash = GeneratePasswordHash(pwd);


                // register the user (creates account + credential)
                var id = await RegisterUserAsync(
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
                if (await HasUserVerificationAsync(connection, id)) continue;

                await AddUserVerificationAsync(connection, id);
                createdVerifications++;
            }

            Console.WriteLine($"Created {createdUsers} user accounts.");
            Console.WriteLine($"Added {createdCredentials} user credentials.");
            Console.WriteLine($"Added {createdVerifications} user verifications.");
        }

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
            await using var command = new SqlCommand("dbo.USP_RegisterUser", connection);
            command.CommandType = CommandType.StoredProcedure;


            command.Parameters.Add("@Username", SqlDbType.VarChar, 64).Value = username;
            command.Parameters.Add("@FirstName", SqlDbType.NVarChar, 128).Value = firstName;
            command.Parameters.Add("@LastName", SqlDbType.NVarChar, 128).Value = lastName;
            command.Parameters.Add("@DateOfBirth", SqlDbType.DateTime).Value = dateOfBirth;
            command.Parameters.Add("@Email", SqlDbType.VarChar, 128).Value = email;
            command.Parameters.Add("@Hash", SqlDbType.NVarChar, -1).Value = hash;

            var result = await command.ExecuteScalarAsync();


            return (Guid)result!;

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
            command.Parameters.AddWithValue("@UserAccountID_", userAccountId);

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
