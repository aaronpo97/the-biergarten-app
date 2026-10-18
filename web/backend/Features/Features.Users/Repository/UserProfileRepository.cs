using System.Data.Common;
using Dapper;
using Database.Connection;
using Domain.Entities;
using Domain.Exceptions;

namespace Features.Users.Repository;

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
                INSERT INTO Social.UserProfile (UserAccountID, Biography)
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
                FROM Social.UserProfile
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
                UPDATE Social.UserProfile
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
                    -- Serialises concurrent replacements for one profile, including the first avatar when no active row exists to lock
                    SELECT 1 FROM Social.UserProfile WITH (UPDLOCK, HOLDLOCK)
                    WHERE UserProfileID = @UserProfileId;

                    -- CK_UserAvatar_ValidRange requires ValidTo > ValidFrom, even within the same millisecond
                    DECLARE @ChangedAt DATETIME2(3) = CAST(SYSUTCDATETIME() AS DATETIME2(3));

                    SELECT @ChangedAt = CASE
                        WHEN @ChangedAt > ValidFrom THEN @ChangedAt
                        ELSE DATEADD(MILLISECOND, 1, ValidFrom)
                    END
                    FROM Social.UserAvatar
                    WHERE UserProfileID = @UserProfileId AND ValidTo IS NULL;

                    UPDATE Social.UserAvatar
                    SET ValidTo = @ChangedAt
                    WHERE UserProfileID = @UserProfileId AND ValidTo IS NULL;

                    INSERT INTO Social.UserAvatar (UserAvatarID, UserProfileID, PhotoID, ValidFrom)
                    VALUES (@UserAvatarId, @UserProfileId, @PhotoId, @ChangedAt);
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
