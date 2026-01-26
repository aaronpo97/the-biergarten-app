CREATE OR ALTER PROCEDURE dbo.USP_RegisterUser(
    @UserAccountId_ UNIQUEIDENTIFIER OUTPUT,
    @Username VARCHAR(64),
    @FirstName NVARCHAR(128),
    @LastName NVARCHAR(128),
    @DateOfBirth DATETIME,
    @Email VARCHAR(128),
    @Hash NVARCHAR(MAX)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    EXEC usp_CreateUserAccount
         @UserAccountId = @UserAccountId_ OUTPUT,
         @Username = @Username,
         @FirstName = @FirstName,
         @LastName = @LastName,
         @DateOfBirth = @DateOfBirth,
         @Email = @Email;

    IF @UserAccountId_ IS NULL
        BEGIN
            THROW 50000, 'Failed to create user account.', 1;
        END


    EXEC dbo.usp_RotateUserCredential
         @UserAccountId = @UserAccountId_,
         @Hash = @Hash;

    IF @@ROWCOUNT = 0
        BEGIN
            THROW 50002, 'Failed to create user credential.', 1;
        END
    COMMIT TRANSACTION;


END