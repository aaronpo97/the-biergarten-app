CREATE OR ALTER PROCEDURE dbo.USP_RotateUserCredential(
    @UserAccountId_ UNIQUEIDENTIFIER,
    @Hash NVARCHAR(MAX)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;

    EXEC USP_GetUserAccountByID @UserAccountId = @UserAccountId_

    IF @@ROWCOUNT = 0
        THROW 50001, 'User account not found', 1;


    -- invalidate all other credentials -- set them to revoked
    UPDATE dbo.UserCredential
    SET IsRevoked = 1,
        RevokedAt = GETDATE()
    WHERE UserAccountId = @UserAccountId_;

    INSERT INTO dbo.UserCredential
        (UserAccountId, Hash)
    VALUES (@UserAccountId_, @Hash);


END;