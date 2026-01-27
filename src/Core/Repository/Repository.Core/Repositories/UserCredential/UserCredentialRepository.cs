using System.Data;
using System.Data.Common;
using DataAccessLayer.Sql;

namespace DataAccessLayer.Repositories.UserCredential
{
    public class UserCredentialRepository(ISqlConnectionFactory connectionFactory)
        : DataAccessLayer.Repositories.Repository<Entities.UserCredential>(connectionFactory), IUserCredentialRepository
    {
        public async Task RotateCredentialAsync(Guid userAccountId, Entities.UserCredential credential)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "USP_RotateUserCredential";
            command.CommandType = CommandType.StoredProcedure;

            AddParameter(command, "@UserAccountId", userAccountId);
            AddParameter(command, "@Hash", credential.Hash);

            await command.ExecuteNonQueryAsync();
        }

        public async Task<Entities.UserCredential?> GetActiveCredentialByUserAccountIdAsync(Guid userAccountId)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "USP_GetActiveUserCredentialByUserAccountId";
            command.CommandType = CommandType.StoredProcedure;

            AddParameter(command, "@UserAccountId", userAccountId);

            await using var reader = await command.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapToEntity(reader) : null;
        }

        public async Task InvalidateCredentialsByUserAccountIdAsync(Guid userAccountId)
        {
            await using var connection = await CreateConnection();
            await using var command = connection.CreateCommand();
            command.CommandText = "USP_InvalidateUserCredential";
            command.CommandType = CommandType.StoredProcedure;

            AddParameter(command, "@UserAccountId", userAccountId);
            await command.ExecuteNonQueryAsync();
        }

        public override Task AddAsync(Entities.UserCredential entity)
            => throw new NotSupportedException("Use RotateCredentialAsync for adding/rotating credentials.");

        public override Task<IEnumerable<Entities.UserCredential>> GetAllAsync(int? limit, int? offset)
            => throw new NotSupportedException("Listing credentials is not supported.");

        public override Task<Entities.UserCredential?> GetByIdAsync(Guid id)
            => throw new NotSupportedException("Fetching credential by ID is not supported.");

        public override Task UpdateAsync(Entities.UserCredential entity)
            => throw new NotSupportedException("Use RotateCredentialAsync to update credentials.");

        public override Task DeleteAsync(Guid id)
            => throw new NotSupportedException("Deleting a credential by ID is not supported.");

        protected override Entities.UserCredential MapToEntity(DbDataReader reader)
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
                .Any(r => string.Equals(r["ColumnName"]?.ToString(), "Timer", StringComparison.OrdinalIgnoreCase)) ?? false;

            if (hasTimer)
            {
                entity.Timer = reader.IsDBNull(reader.GetOrdinal("Timer")) ? null : (byte[])reader["Timer"];
            }

            return entity;
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
