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
    /// <remarks>
    ///     Left-joins <c>Social.UserProfile</c>, so <see cref="UserAccount.UserProfile" /> is
    ///     <c>null</c> for an account whose profile has yet to be created, and left-joins the
    ///     account's active <c>Social.UserAvatar</c> (<c>ValidTo IS NULL</c>) with its
    ///     <c>Media.Photo</c>, so <see cref="UserAccount.UserAvatar" /> is <c>null</c> for an account
    ///     with no avatar.
    /// </remarks>
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
            $"""
            SELECT 
                ua.UserAccountID, ua.Username, ua.FirstName, ua.LastName,
                ua.Email, ua.CreatedAt, ua.UpdatedAt, ua.DateOfBirth,
                ua.RowVersion, {FollowCountColumns}, up.UserProfileID, up.UserAccountID,
                up.Biography, up.RowVersion, p.PhotoID, p.UploadedByID, 
                p.Hyperlink, p.UploadedAt, p.RowVersion, av.UserAvatarID, 
                av.UserProfileID, av.PhotoID, av.ValidFrom, av.ValidTo,
                av.RowVersion
            FROM Auth.UserAccount ua
            LEFT JOIN Social.UserProfile up 
                ON ua.UserAccountID = up.UserAccountID
            {ActiveAvatarJoins}
            WHERE ua.UserAccountID = @UserAccountId
            """,
            MapUserRow,
            new { UserAccountId = id },
            splitOn: AvatarSplitOn
        );

        return results.SingleOrDefault();
    }

    /// <inheritdoc />
    /// <remarks>
    ///     Always applies pagination via <c>OFFSET</c>/<c>FETCH</c>, ordered by creation date descending.
    ///     A <c>null</c> <paramref name="limit" />/<paramref name="offset" /> is treated as "no limit"/"no offset".
    ///     Joins the same profile and active-avatar rows as <see cref="GetByIdAsync" />, both of which are
    ///     part of a public profile. Does not select <c>Email</c> or <c>DateOfBirth</c>: this listing is
    ///     consumed only as public profiles, so those fields are left at their default rather than read
    ///     from the database.
    /// </remarks>
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
            $"""
            SELECT
                ua.UserAccountID, ua.Username, ua.FirstName, ua.LastName,
                ua.CreatedAt, ua.UpdatedAt, ua.RowVersion, {FollowCountColumns},
                up.UserProfileID, up.UserAccountID, up.Biography, up.RowVersion,
                p.PhotoID, p.UploadedByID, p.Hyperlink, p.UploadedAt, p.RowVersion,
                av.UserAvatarID, av.UserProfileID, av.PhotoID, av.ValidFrom, av.ValidTo,
                av.RowVersion
            FROM Auth.UserAccount ua
            LEFT JOIN Social.UserProfile up ON ua.UserAccountID = up.UserAccountID
            {ActiveAvatarJoins}
            ORDER BY ua.CreatedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
            """,
            MapUserRow,
            new { Offset = offset ?? 0, Limit = limit ?? int.MaxValue },
            splitOn: AvatarSplitOn
        );
    }

    public async Task<IEnumerable<FollowedUser>> GetFollowingAsync(
        Guid userAccountId,
        int limit,
        int offset
    )
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryAsync<FollowedUser>(
            $"""
            SELECT
                ua.UserAccountID, ua.Username, ua.FirstName, ua.LastName,
                p.Hyperlink AS AvatarKey, f.CreatedAt AS FollowedAt
            FROM Social.UserFollow f
            JOIN Auth.UserAccount ua ON ua.UserAccountID = f.FollowingID
            LEFT JOIN Social.UserProfile up ON ua.UserAccountID = up.UserAccountID
            {ActiveAvatarJoins}
            WHERE f.UserAccountID = @UserAccountId
            ORDER BY f.CreatedAt DESC, ua.Username
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
            """,
            new
            {
                UserAccountId = userAccountId,
                Offset = offset,
                Limit = limit,
            }
        );
    }

    private const string FollowCountColumns = """
        (SELECT COUNT(*) FROM Social.UserFollow WHERE FollowingID = ua.UserAccountID) AS FollowerCount,
        (SELECT COUNT(*) FROM Social.UserFollow WHERE UserAccountID = ua.UserAccountID) AS FollowingCount
        """;

    private const string ActiveAvatarJoins = """
        LEFT JOIN Social.UserAvatar av
            ON up.UserProfileID = av.UserProfileID AND av.ValidTo IS NULL
        LEFT JOIN Media.Photo p ON av.PhotoID = p.PhotoID
        """;

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
