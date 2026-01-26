using DataAccessLayer.Entities;
using DataAccessLayer.Sql;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DataAccessLayer.Repositories
{
    public class UserAccountRepository(ISqlConnectionFactory connectionFactory)
        : Repository<UserAccount>(connectionFactory), IUserAccountRepository
    {
        public override async Task Add(UserAccount userAccount)
        {
            await using var connection = await CreateConnection();
            await using var command = new SqlCommand("usp_CreateUserAccount", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add("@UserAccountId", SqlDbType.UniqueIdentifier).Value = userAccount.UserAccountId;
            command.Parameters.Add("@Username", SqlDbType.NVarChar, 100).Value = userAccount.Username;
            command.Parameters.Add("@FirstName", SqlDbType.NVarChar, 100).Value = userAccount.FirstName;
            command.Parameters.Add("@LastName", SqlDbType.NVarChar, 100).Value = userAccount.LastName;
            command.Parameters.Add("@Email", SqlDbType.NVarChar, 256).Value = userAccount.Email;
            command.Parameters.Add("@DateOfBirth", SqlDbType.Date).Value = userAccount.DateOfBirth;

            await command.ExecuteNonQueryAsync();
        }

        public override async Task<UserAccount?> GetById(Guid id)
        {
            await using var connection = await CreateConnection();
            await using var command = new SqlCommand("usp_GetUserAccountById", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.Add("@UserAccountId", SqlDbType.UniqueIdentifier).Value = id;

            await using var reader = await command.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapToEntity(reader) : null;
        }

        public override async Task<IEnumerable<UserAccount>> GetAll(int? limit, int? offset)
        {
            await using var connection = await CreateConnection();
            await using var command = new SqlCommand("usp_GetAllUserAccounts", connection);
            command.CommandType = CommandType.StoredProcedure;

            if (limit.HasValue)
                command.Parameters.Add("@Limit", SqlDbType.Int).Value = limit.Value;

            if (offset.HasValue)
                command.Parameters.Add("@Offset", SqlDbType.Int).Value = offset.Value;

            await using var reader = await command.ExecuteReaderAsync();
            var users = new List<UserAccount>();

            while (await reader.ReadAsync())
            {
                users.Add(MapToEntity(reader));
            }

            return users;
        }

        public override async Task Update(UserAccount userAccount)
        {
            await using var connection = await CreateConnection();
            await using var command = new SqlCommand("usp_UpdateUserAccount", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add("@UserAccountId", SqlDbType.UniqueIdentifier).Value = userAccount.UserAccountId;
            command.Parameters.Add("@Username", SqlDbType.NVarChar, 100).Value = userAccount.Username;
            command.Parameters.Add("@FirstName", SqlDbType.NVarChar, 100).Value = userAccount.FirstName;
            command.Parameters.Add("@LastName", SqlDbType.NVarChar, 100).Value = userAccount.LastName;
            command.Parameters.Add("@Email", SqlDbType.NVarChar, 256).Value = userAccount.Email;
            command.Parameters.Add("@DateOfBirth", SqlDbType.Date).Value = userAccount.DateOfBirth;

            await command.ExecuteNonQueryAsync();
        }

        public override async Task Delete(Guid id)
        {
            await using var connection = await CreateConnection();
            await using var command = new SqlCommand("usp_DeleteUserAccount", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add("@UserAccountId", SqlDbType.UniqueIdentifier).Value = id;
            await command.ExecuteNonQueryAsync();
        }

        public async Task<UserAccount?> GetByUsername(string username)
        {
            await using var connection = await CreateConnection();
            await using var command = new SqlCommand("usp_GetUserAccountByUsername", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add("@Username", SqlDbType.NVarChar, 100).Value = username;

            await using var reader = await command.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapToEntity(reader) : null;
        }

        public async Task<UserAccount?> GetByEmail(string email)
        {
            await using var connection = await CreateConnection();
            await using var command = new SqlCommand("usp_GetUserAccountByEmail", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add("@Email", SqlDbType.NVarChar, 256).Value = email;

            await using var reader = await command.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapToEntity(reader) : null;
        }

        protected override UserAccount MapToEntity(SqlDataReader reader)
        {
            return new UserAccount
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
    }
}
