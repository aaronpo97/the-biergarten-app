CREATE
OR
ALTER PROCEDURE usp_CreateUserAccount
    (
    @UserAccountId UNIQUEIDENTIFIER OUTPUT,
    @Username VARCHAR (64),
    @FirstName NVARCHAR(128),
    @LastName NVARCHAR(128),
    @DateOfBirth DATETIME,
    @Email VARCHAR (128)
    )
    AS
BEGIN
    SET
NOCOUNT ON;

    DECLARE
@Inserted TABLE (UserAccountID UNIQUEIDENTIFIER);

INSERT INTO UserAccount
(Username,
 FirstName,
 LastName,
 DateOfBirth,
 Email)
    OUTPUT INSERTED.UserAccountID INTO @Inserted
VALUES
    (
    @Username, @FirstName, @LastName, @DateOfBirth, @Email
    );

SELECT @UserAccountId = UserAccountID
FROM @Inserted;
END;
