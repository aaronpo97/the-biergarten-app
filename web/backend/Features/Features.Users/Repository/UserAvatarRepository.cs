using System.Data.Common;
using Dapper;
using Database.Connection;
using Domain.Entities;

namespace Features.Auth.Repository;

/// <summary>
///     Dapper-based implementation of <see cref="IUserAvatarRepository" />.
/// </summary>
public class UserAvatarRepository(ISqlConnectionFactory connectionFactory)
    : DapperRepository(connectionFactory),
        IUserAvatarRepository
{
    /// <inheritdoc />
    public async Task SaveAsync(UserAvatar avatar, CancellationToken cancellationToken)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction = await connection.BeginTransactionAsync(cancellationToken);

        try
        {
            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    UPDATE dbo.UserAvatar
                    SET ValidTo = SYSUTCDATETIME()
                    WHERE UserProfileID = @UserProfileId AND ValidTo IS NULL
                    """,
                    new { avatar.UserProfileId },
                    transaction
                )
            );

            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    INSERT INTO dbo.UserAvatar (UserAvatarID, UserProfileID, PhotoID)
                    VALUES (@UserAvatarId, @UserProfileId, @PhotoId)
                    """,
                    new { avatar.UserAvatarId, avatar.UserProfileId, avatar.PhotoId },
                    transaction
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
}
