using System.Data.Common;
using Dapper;
using Database.Connection;
using Domain.Entities;
using Domain.Exceptions;

namespace Features.Auth.Repository;

/// <summary>
///     Dapper-based implementation of <see cref="IUserProfileRepository" />.
/// </summary>
public class UserProfileRepository(ISqlConnectionFactory connectionFactory)
    : DapperRepository(connectionFactory),
        IUserProfileRepository
{
    /// <inheritdoc />
    public async Task<Guid> CreateProfileAsync(
        Guid userAccountId,
        string biography,
        CancellationToken cancellationToken
    )
    {
        await using DbConnection connection = await CreateConnection();

        return await connection.ExecuteScalarAsync<Guid>(
            new CommandDefinition(
                """
                INSERT INTO dbo.UserProfile (UserAccountID, Biography)
                OUTPUT INSERTED.UserProfileID
                VALUES (@UserAccountId, @Biography)
                """,
                new { UserAccountId = userAccountId, Biography = biography },
                cancellationToken: cancellationToken
            )
        );
    }

    /// <inheritdoc />
    public async Task<Guid> GetProfileIdAsync(
        Guid userAccountId,
        CancellationToken cancellationToken
    )
    {
        await using DbConnection connection = await CreateConnection();

        Guid? userProfileId = await connection.ExecuteScalarAsync<Guid?>(
            new CommandDefinition(
                """
                SELECT UserProfileID
                FROM dbo.UserProfile
                WHERE UserAccountID = @UserAccountId
                """,
                new { UserAccountId = userAccountId },
                cancellationToken: cancellationToken
            )
        );

        return userProfileId
            ?? throw new NotFoundException(
                $"No user profile found for user account ID {userAccountId}"
            );
    }

    /// <inheritdoc />
    public async Task UpdateBiographyAsync(
        Guid userAccountId,
        string biography,
        CancellationToken cancellationToken
    )
    {
        await using DbConnection connection = await CreateConnection();

        int updatedRows = await connection.ExecuteAsync(
            new CommandDefinition(
                """
                UPDATE dbo.UserProfile
                SET Biography = @Biography
                WHERE UserAccountID = @UserAccountId
                """,
                new { UserAccountId = userAccountId, Biography = biography },
                cancellationToken: cancellationToken
            )
        );

        if (updatedRows == 0)
            throw new NotFoundException(
                $"No user profile found for user account ID {userAccountId}"
            );
    }

    /// <inheritdoc />
    public async Task SaveAvatarAsync(UserAvatar avatar, CancellationToken cancellationToken)
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
                    UPDATE dbo.UserAvatar
                    SET ValidTo = SYSUTCDATETIME()
                    WHERE UserProfileID = @UserProfileId AND ValidTo IS NULL
                    """,
                    new { avatar.UserProfileId },
                    transaction: transaction,
                    cancellationToken: cancellationToken
                )
            );

            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    INSERT INTO dbo.UserAvatar (UserAvatarID, UserProfileID, PhotoID)
                    VALUES (@UserAvatarId, @UserProfileId, @PhotoId)
                    """,
                    new
                    {
                        avatar.UserAvatarId,
                        avatar.UserProfileId,
                        avatar.PhotoId,
                    },
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
}
