CREATE OR ALTER PROCEDURE dbo.USP_AddUserCredential(
    @UserAccountId uniqueidentifier,
    @Hash nvarchar(max)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF NOT EXISTS (
        SELECT 1 
        FROM dbo.UserAccount 
        WHERE UserAccountID = @UserAccountId
    )
        THROW 50001, 'UserAccountID does not exist.', 1;
    
    IF EXISTS (
        SELECT 1 
        FROM dbo.UserCredential
        WHERE UserAccountID = @UserAccountId
    )
        THROW 50002, 'UserCredential for this UserAccountID already exists.', 1;
    

    INSERT INTO dbo.UserCredential
        (UserAccountId, Hash)
    VALUES 
        (@UserAccountId, @Hash);

    COMMIT TRANSACTION;
END;