CREATE OR ALTER PROCEDURE usp_UpdateUserAccount(
    @Username VARCHAR(64),
    @FirstName NVARCHAR(128),
    @LastName NVARCHAR(128),
    @DateOfBirth DATETIME,
    @Email VARCHAR(128),
    @UserAccountId UNIQUEIDENTIFIER
)
AS
BEGIN
    SET
        NOCOUNT ON;

    UPDATE UserAccount
    SET Username    = @Username,
        FirstName   = @FirstName,
        LastName    = @LastName,
        DateOfBirth = @DateOfBirth,
        Email       = @Email
    WHERE UserAccountId = @UserAccountId;

    IF @@ROWCOUNT = 0
        BEGIN
            THROW
                50001, 'UserAccount with the specified ID does not exist.', 1;
        END
END;
