
CREATE OR ALTER PROCEDURE usp_CreateUserAccount
(
    @UserAccountId UNIQUEIDENTIFIER = NULL,
    @Username VARCHAR(64),
    @FirstName NVARCHAR(128),
    @LastName NVARCHAR(128),
    @DateOfBirth DATETIME,
    @Email VARCHAR(128)
)
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON
    BEGIN TRANSACTION

    INSERT INTO UserAccount 
    (
        UserAccountID,
        Username,
        FirstName,
        LastName,
        DateOfBirth,
        Email
    )
    VALUES
    (
        COALESCE(@UserAccountId, NEWID()),
        @Username,
        @FirstName,
        @LastName,
        @DateOfBirth,
        @Email
    );
    COMMIT TRANSACTION
END;
