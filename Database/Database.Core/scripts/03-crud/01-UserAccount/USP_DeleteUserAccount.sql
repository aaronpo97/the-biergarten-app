
CREATE OR ALTER PROCEDURE usp_DeleteUserAccount
(
    @UserAccountId UNIQUEIDENTIFIER
)
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON
    BEGIN TRANSACTION

    IF NOT EXISTS (SELECT 1 FROM UserAccount WHERE UserAccountId = @UserAccountId)
    BEGIN
        RAISERROR('UserAccount with the specified ID does not exist.', 16,
        1);
        ROLLBACK TRANSACTION
        RETURN
    END

    DELETE FROM UserAccount 
    WHERE UserAccountId = @UserAccountId;
    COMMIT TRANSACTION
END;
