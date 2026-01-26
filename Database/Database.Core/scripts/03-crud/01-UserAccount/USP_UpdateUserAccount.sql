
CREATE OR ALTER PROCEDURE usp_UpdateUserAccount
(
    @Username VARCHAR(64),
    @FirstName NVARCHAR(128),
    @LastName NVARCHAR(128),
    @DateOfBirth DATETIME,
    @Email VARCHAR(128),
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

    UPDATE UserAccount
    SET
        Username = @Username,
        FirstName = @FirstName,
        LastName = @LastName,
        DateOfBirth = @DateOfBirth,
        Email = @Email
    WHERE UserAccountId = @UserAccountId;

    COMMIT TRANSACTION
END;
