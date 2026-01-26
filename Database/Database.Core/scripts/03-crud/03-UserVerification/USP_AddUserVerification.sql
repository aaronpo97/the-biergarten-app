CREATE OR ALTER PROCEDURE dbo.USP_CreateUserVerification @UserAccountID_ UNIQUEIDENTIFIER,
                                                         @VerificationDateTime DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @VerificationDateTime IS NULL
        SET @VerificationDateTime = GETDATE();

    BEGIN TRANSACTION;

    EXEC USP_GetUserAccountByID @UserAccountId = @UserAccountID_;
    IF @@ROWCOUNT = 0
        THROW 50001, 'Could not find a user with that id', 1;

    INSERT INTO dbo.UserVerification
        (UserAccountId, VerificationDateTime)
    VALUES (@UserAccountID_, @VerificationDateTime);

    COMMIT TRANSACTION;
END
