CREATE OR ALTER PROCEDURE dbo.USP_InvalidateUserCredential(
    @UserAccountId_ UNIQUEIDENTIFIER
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    EXEC dbo.USP_GetUserAccountByID @UserAccountId = @UserAccountId_;
    IF @@ROWCOUNT = 0
        THROW 50001, 'User account not found', 1;

    -- invalidate all other credentials by setting them to revoked
    UPDATE dbo.UserCredential
    SET IsRevoked = 1,
        RevokedAt = GETDATE()
    WHERE UserAccountId = @UserAccountId_
      AND IsRevoked != 1;


    COMMIT TRANSACTION;
END;