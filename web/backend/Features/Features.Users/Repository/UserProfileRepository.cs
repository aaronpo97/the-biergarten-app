using System.Data.Common;
using Dapper;
using Database.Connection;

namespace Features.Auth.Repository;

/// <summary>
///     Dapper-based implementation of <see cref="IUserProfileRepository" />.
/// </summary>
public class UserProfileRepository(ISqlConnectionFactory connectionFactory)
    : DapperRepository(connectionFactory),
        IUserProfileRepository
{
    /// <inheritdoc />
    public async Task<Guid> GetOrCreateProfileIdAsync(
        Guid userAccountId,
        CancellationToken cancellationToken
    )
    {
        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction = await connection.BeginTransactionAsync(cancellationToken);

        try
        {
            // UPDLOCK/HOLDLOCK: AK_UserProfile_UserAccountID is composite with UserProfileID, so it
            // doesn't by itself stop two concurrent callers from creating duplicate profiles for the
            // same account; holding the lock through the transaction serializes them instead.
            Guid? userProfileId = await connection.ExecuteScalarAsync<Guid?>(
                new CommandDefinition(
                    """
                    SELECT UserProfileID
                    FROM dbo.UserProfile WITH (UPDLOCK, HOLDLOCK)
                    WHERE UserAccountID = @UserAccountId
                    """,
                    new { UserAccountId = userAccountId },
                    transaction
                )
            );

            if (userProfileId is null)
            {
                userProfileId = Guid.NewGuid();

                await connection.ExecuteAsync(
                    new CommandDefinition(
                        """
                        INSERT INTO dbo.UserProfile (UserProfileID, Biography, UserAccountID)
                        VALUES (@UserProfileId, '', @UserAccountId)
                        """,
                        new { UserProfileId = userProfileId, UserAccountId = userAccountId },
                        transaction
                    )
                );
            }

            await transaction.CommitAsync(cancellationToken);
            return userProfileId.Value;
        }
        catch
        {
            await RollbackQuietlyAsync(transaction);
            throw;
        }
    }
}
