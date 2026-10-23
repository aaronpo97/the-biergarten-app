using System.Data.Common;
using Dapper;
using Database.Connection;

namespace Features.Users.Repository;

public class UserFollowRepository(ISqlConnectionFactory connectionFactory)
    : DapperRepository(connectionFactory),
        IUserFollowRepository
{
    public async Task FollowAsync(
        Guid followerId,
        Guid followingId,
        CancellationToken cancellationToken
    )
    {
        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction = await connection.BeginTransactionAsync(
            cancellationToken
        );

        try
        {
            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    IF NOT EXISTS (
                        SELECT 1 FROM Social.UserFollow WITH (UPDLOCK, HOLDLOCK)
                        WHERE UserAccountID = @FollowerId AND FollowingID = @FollowingId
                    )
                        INSERT INTO Social.UserFollow (UserAccountID, FollowingID)
                        VALUES (@FollowerId, @FollowingId);
                    """,
                    new { FollowerId = followerId, FollowingId = followingId },
                    transaction: transaction,
                    cancellationToken: cancellationToken
                )
            );

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await RollbackQuietlyAsync(transaction);
            throw;
        }
    }

    public async Task UnfollowAsync(
        Guid followerId,
        Guid followingId,
        CancellationToken cancellationToken
    )
    {
        await using DbConnection connection = await CreateConnection();

        await connection.ExecuteAsync(
            new CommandDefinition(
                """
                DELETE FROM Social.UserFollow
                WHERE UserAccountID = @FollowerId AND FollowingID = @FollowingId
                """,
                new { FollowerId = followerId, FollowingId = followingId },
                cancellationToken: cancellationToken
            )
        );
    }

    public async Task<bool> IsFollowingAsync(
        Guid followerId,
        Guid followingId,
        CancellationToken cancellationToken
    )
    {
        await using DbConnection connection = await CreateConnection();

        return await connection.ExecuteScalarAsync<bool>(
            new CommandDefinition(
                """
                SELECT CASE WHEN EXISTS (
                    SELECT 1 FROM Social.UserFollow
                    WHERE UserAccountID = @FollowerId AND FollowingID = @FollowingId
                ) THEN 1 ELSE 0 END
                """,
                new { FollowerId = followerId, FollowingId = followingId },
                cancellationToken: cancellationToken
            )
        );
    }
}
