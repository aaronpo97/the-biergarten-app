using System.Data;
using System.Data.Common;
using Repository.Core.Sql;

namespace Repository.Core.Repositories.Auth
{
    public class AuthRepository : Repository<Entities.UserAccount>, IAuthRepository
    {
        public AuthRepository(ISqlConnectionFactory connectionFactory)
            : base(connectionFactory)
        {
        }


        public async Task<Entities.UserAccount> RegisterUserAsync(
            string username,
            string firstName,
            string lastName,
            string email,
            DateTime dateOfBirth,
            string passwordHash)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "USP_RegisterUser";
            command.CommandType = CommandType.StoredProcedure;

            // Input parameters
            AddParameter(command, "@Username", username);
            AddParameter(command, "@FirstName", firstName);
            AddParameter(command, "@LastName", lastName);
            AddParameter(command, "@Email", email);
            AddParameter(command, "@DateOfBirth", dateOfBirth);
            AddParameter(command, "@Hash", passwordHash);

            // Execute and retrieve the generated UserAccountId from result set
            var result = await command.ExecuteScalarAsync();
            var userAccountId = result != null ? (Guid)result : Guid.Empty;

            // Return the newly created user account
            return new Entities.UserAccount
            {
                UserAccountId = userAccountId,
                Username = username,
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                DateOfBirth = dateOfBirth,
                CreatedAt = DateTime.UtcNow
            };
        }


        public async Task<Entities.UserAccount?> GetUserByEmailAsync(string email)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "usp_GetUserAccountByEmail";
            command.CommandType = CommandType.StoredProcedure;

            AddParameter(command, "@Email", email);

            await using var reader = await command.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapToEntity(reader) : null;
        }


        public async Task<Entities.UserAccount?> GetUserByUsernameAsync(string username)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "usp_GetUserAccountByUsername";
            command.CommandType = CommandType.StoredProcedure;

            AddParameter(command, "@Username", username);

            await using var reader = await command.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapToEntity(reader) : null;
        }

        public async Task<Entities.UserCredential?> GetActiveCredentialByUserAccountIdAsync(Guid userAccountId)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "USP_GetActiveUserCredentialByUserAccountId";
            command.CommandType = CommandType.StoredProcedure;

            AddParameter(command, "@UserAccountId", userAccountId);

            await using var reader = await command.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapToCredentialEntity(reader) : null;
        }

        public async Task RotateCredentialAsync(Guid userAccountId, string newPasswordHash)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "USP_RotateUserCredential";
            command.CommandType = CommandType.StoredProcedure;

            AddParameter(command, "@UserAccountId_", userAccountId);
            AddParameter(command, "@Hash", newPasswordHash);

            await command.ExecuteNonQueryAsync();
        }


        public async Task InvalidateCredentialsByUserAccountIdAsync(Guid userAccountId)
        {
            throw new NotImplementedException("InvalidateCredentialsByUserAccountIdAsync");
        }

        /// <summary>
        /// Maps a data reader row to a UserAccount entity.
        /// </summary>
        protected override Entities.UserAccount MapToEntity(DbDataReader reader)
        {
            return new Entities.UserAccount
            {
                UserAccountId = reader.GetGuid(reader.GetOrdinal("UserAccountId")),
                Username = reader.GetString(reader.GetOrdinal("Username")),
                FirstName = reader.GetString(reader.GetOrdinal("FirstName")),
                LastName = reader.GetString(reader.GetOrdinal("LastName")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                UpdatedAt = reader.IsDBNull(reader.GetOrdinal("UpdatedAt"))
                    ? null
                    : reader.GetDateTime(reader.GetOrdinal("UpdatedAt")),
                DateOfBirth = reader.GetDateTime(reader.GetOrdinal("DateOfBirth")),
                Timer = reader.IsDBNull(reader.GetOrdinal("Timer"))
                    ? null
                    : (byte[])reader["Timer"]
            };
        }

        /// <summary>
        /// Maps a data reader row to a UserCredential entity.
        /// </summary>
        private static Entities.UserCredential MapToCredentialEntity(DbDataReader reader)
        {
            var entity = new Entities.UserCredential
            {
                UserCredentialId = reader.GetGuid(reader.GetOrdinal("UserCredentialId")),
                UserAccountId = reader.GetGuid(reader.GetOrdinal("UserAccountId")),
                Hash = reader.GetString(reader.GetOrdinal("Hash")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
            };

            // Optional columns
            var hasTimer = reader.GetSchemaTable()?.Rows
                               .Cast<System.Data.DataRow>()
                               .Any(r => string.Equals(r["ColumnName"]?.ToString(), "Timer",
                                   StringComparison.OrdinalIgnoreCase)) ??
                           false;

            if (hasTimer)
            {
                entity.Timer = reader.IsDBNull(reader.GetOrdinal("Timer")) ? null : (byte[])reader["Timer"];
            }

            return entity;
        }

        /// <summary>
        /// Helper method to add a parameter to a database command.
        /// </summary>
        private static void AddParameter(DbCommand command, string name, object? value)
        {
            var p = command.CreateParameter();
            p.ParameterName = name;
            p.Value = value ?? DBNull.Value;
            command.Parameters.Add(p);
        }
    }
}