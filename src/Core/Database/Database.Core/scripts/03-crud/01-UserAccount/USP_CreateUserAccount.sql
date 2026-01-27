
CREATE OR ALTER PROCEDURE usp_CreateUserAccount
(
    @UserAccountId UNIQUEIDENTIFIER OUTPUT,
    @Username VARCHAR(64),
    @FirstName NVARCHAR(128),
    @LastName NVARCHAR(128),
    @DateOfBirth DATETIME,
    @Email VARCHAR(128)
)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO UserAccount 
    (
        Username,
        FirstName,
        LastName,
        DateOfBirth,
        Email
    )
    VALUES
    (
        @Username,
        @FirstName,
        @LastName,
        @DateOfBirth,
        @Email
    );

    SELECT @UserAccountId AS UserAccountId;
END;
