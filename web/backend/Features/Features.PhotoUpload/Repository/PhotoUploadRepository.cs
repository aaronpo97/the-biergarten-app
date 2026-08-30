using System.Data.Common;
using Dapper;
using Database.Connection;
using Domain.Entities;
using Domain.Exceptions;

namespace Features.ImageUploads.Repository;

public interface IPhotoUploadRepository
{
    Task CreateAsync(Photo photo, CancellationToken cancellationToken);
}

public class PhotoUploadRepository(ISqlConnectionFactory connectionFactory)
    : DapperRepository(connectionFactory),
        IPhotoUploadRepository
{
    public async Task CreateAsync(Photo photo, CancellationToken cancellationToken)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction = await connection.BeginTransactionAsync(cancellationToken);

        try
        {
            bool userExists =
                await connection.ExecuteScalarAsync<int?>(
                    new CommandDefinition(
                        """
                                    SELECT 1
                                    FROM
                                        dbo.UserAccount
                                    WHERE
                                        UserAccountID = @UploadedById
                        """,
                        new { photo.UploadedById },
                        transaction
                    )
                )
                is not null;

            if (!userExists)
                throw new NotFoundException("User not found.");

            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    INSERT INTO dbo.Photo (PhotoID, Hyperlink, UploadedByID)
                    VALUES (@PhotoId, @Hyperlink, @UploadedById)
                    """,
                    new { photo.PhotoId, photo.Hyperlink, photo.UploadedById },
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
