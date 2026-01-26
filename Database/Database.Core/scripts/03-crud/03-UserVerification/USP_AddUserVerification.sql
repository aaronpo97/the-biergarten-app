CREATE OR ALTER PROCEDURE dbo.USP_CreateUserVerification
    @UserAccountID uniqueidentifier,
    @VerificationDateTime datetime = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @VerificationDateTime IS NULL
        SET @VerificationDateTime = GETDATE();

    BEGIN TRANSACTION;

    INSERT INTO dbo.UserVerification
    (UserAccountId, VerificationDateTime)
    VALUES
        (@UserAccountID, @VerificationDateTime);

    COMMIT TRANSACTION;
END
