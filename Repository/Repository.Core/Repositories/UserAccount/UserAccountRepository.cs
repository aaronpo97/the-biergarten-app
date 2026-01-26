using System.Data;
using System.Data.Common;
using DataAccessLayer.Sql;

namespace DataAccessLayer.Repositories.UserAccount
{
    public class UserAccountRepository(ISqlConnectionFactory connectionFactory)
        : Repository<Entities.UserAccount>(connectionFactory), IUserAccountRepository
    {
        /**
         * @todo update the create user account stored proc to add user credential creation in
         *       a single transaction, use that transaction instead.
         */
        public override async Task AddAsync(Entities.UserAccount userAccount)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "usp_CreateUserAccount";
            command.CommandType = CommandType.StoredProcedure;
            AddParameter(command, "@UserAccountId", userAccount.UserAccountId);
            AddParameter(command, "@Username", userAccount.Username);
            AddParameter(command, "@FirstName", userAccount.FirstName);
            AddParameter(command, "@LastName", userAccount.LastName);
            AddParameter(command, "@Email", userAccount.Email);
            AddParameter(command, "@DateOfBirth", userAccount.DateOfBirth);

            await command.ExecuteNonQueryAsync();
        }

        public override async Task<Entities.UserAccount?> GetByIdAsync(Guid id)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "usp_GetUserAccountById";
            command.CommandType = CommandType.StoredProcedure;

            AddParameter(command, "@UserAccountId", id);

            await using var reader = await command.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapToEntity(reader) : null;
        }

        public override async Task<IEnumerable<Entities.UserAccount>> GetAllAsync(int? limit, int? offset)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "usp_GetAllUserAccounts";
            command.CommandType = CommandType.StoredProcedure;

            if (limit.HasValue)
                AddParameter(command, "@Limit", limit.Value);

            if (offset.HasValue)
                AddParameter(command, "@Offset", offset.Value);

            await using var reader = await command.ExecuteReaderAsync();
            var users = new List<Entities.UserAccount>();

            while (await reader.ReadAsync())
            {
                users.Add(MapToEntity(reader));
            }

            return users;
        }

        public override async Task UpdateAsync(Entities.UserAccount userAccount)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "usp_UpdateUserAccount";
            command.CommandType = CommandType.StoredProcedure;

            AddParameter(command, "@UserAccountId", userAccount.UserAccountId);
            AddParameter(command, "@Username", userAccount.Username);
            AddParameter(command, "@FirstName", userAccount.FirstName);
            AddParameter(command, "@LastName", userAccount.LastName);
            AddParameter(command, "@Email", userAccount.Email);
            AddParameter(command, "@DateOfBirth", userAccount.DateOfBirth);

            await command.ExecuteNonQueryAsync();
        }

        public override async Task DeleteAsync(Guid id)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "usp_DeleteUserAccount";
            command.CommandType = CommandType.StoredProcedure;

            AddParameter(command, "@UserAccountId", id);
            await command.ExecuteNonQueryAsync();
        }

        public async Task<Entities.UserAccount?> GetByUsernameAsync(string username)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "usp_GetUserAccountByUsername";
            command.CommandType = CommandType.StoredProcedure;

            AddParameter(command, "@Username", username);

            await using var reader = await command.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapToEntity(reader) : null;
        }

        public async Task<Entities.UserAccount?> GetByEmailAsync(string email)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "usp_GetUserAccountByEmail";
            command.CommandType = CommandType.StoredProcedure;

            AddParameter(command, "@Email", email);

            await using var reader = await command.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapToEntity(reader) : null;
        }

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

        private static void AddParameter(DbCommand command, string name, object? value)
        {
            var p = command.CreateParameter();
            p.ParameterName = name;
            p.Value = value ?? DBNull.Value;
            command.Parameters.Add(p);
        }
    }
}
