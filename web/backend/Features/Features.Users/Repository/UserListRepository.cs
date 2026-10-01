using System.Data.Common;
using Dapper;
using Database.Connection;
using Domain.Entities;

namespace Features.Users.Repository;

/// <summary>
///     Dapper-based implementation of <see cref="IUserListRepository" />.
/// </summary>
public class UserListRepository(ISqlConnectionFactory connectionFactory)
    : DapperRepository(connectionFactory),
        IUserListRepository
{
    /// <inheritdoc />
    public async Task<UserAccount?> GetByIdAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        IEnumerable<UserAccount> results = await connection.QueryAsync<
            UserAccount,
            UserProfile,
            Photo,
            UserAvatar,
            UserAccount
        >(
            """
            SELECT 
                ua.UserAccountID, ua.Username, ua.FirstName, ua.LastName,
                ua.Email, ua.CreatedAt, ua.UpdatedAt, ua.DateOfBirth,
                ua.RowVersion, up.UserProfileID, up.UserAccountID,
                up.Biography, up.RowVersion, p.PhotoID, p.UploadedByID, 
                p.Hyperlink, p.UploadedAt, p.RowVersion, av.UserAvatarID, 
                av.UserProfileID, av.PhotoID, av.ValidFrom, av.ValidTo,
                av.RowVersion
            FROM Auth.UserAccount ua
            LEFT JOIN Social.UserProfile up 
                ON ua.UserAccountID = up.UserAccountID
            LEFT JOIN Social.UserAvatar av
                ON up.UserProfileID = av.UserProfileID 
                       AND av.ValidTo IS NULL
            LEFT JOIN Media.Photo p ON av.PhotoID = p.PhotoID
            WHERE ua.UserAccountID = @UserAccountId
            """,
            MapUserRow,
            new { UserAccountId = id },
            splitOn: AvatarSplitOn
        );

        return results.SingleOrDefault();
    }

    /// <inheritdoc />
    public async Task<IEnumerable<UserAccount>> GetAllAsync(int? limit, int? offset)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryAsync<
            UserAccount,
            UserProfile,
            Photo,
            UserAvatar,
            UserAccount
        >(
            """
            SELECT
                ua.UserAccountID, ua.Username, ua.FirstName, ua.LastName,
                ua.CreatedAt, ua.UpdatedAt, ua.RowVersion,
                up.UserProfileID, up.UserAccountID, up.Biography, up.RowVersion,
                p.PhotoID, p.UploadedByID, p.Hyperlink, p.UploadedAt, p.RowVersion,
                av.UserAvatarID, av.UserProfileID, av.PhotoID, av.ValidFrom, av.ValidTo,
                av.RowVersion
            FROM Auth.UserAccount ua
            LEFT JOIN Social.UserProfile up ON ua.UserAccountID = up.UserAccountID
            LEFT JOIN Social.UserAvatar av
                ON up.UserProfileID = av.UserProfileID AND av.ValidTo IS NULL
            LEFT JOIN Media.Photo p ON av.PhotoID = p.PhotoID
            ORDER BY ua.CreatedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
            """,
            MapUserRow,
            new { Offset = offset ?? 0, Limit = limit ?? int.MaxValue },
            splitOn: AvatarSplitOn
        );
    }
    
    private const string AvatarSplitOn = "UserProfileID,PhotoID,UserAvatarID";

    private static UserAccount MapUserRow(
        UserAccount user,
        UserProfile? profile,
        Photo? photo,
        UserAvatar? avatar
    )
    {
        user.UserProfile = profile;
        avatar?.Photo = photo;
        user.UserAvatar = avatar;
        return user;
    }
}
