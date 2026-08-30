CREATE TABLE dbo.UserAccount
(
    UserAccountID UNIQUEIDENTIFIER
        CONSTRAINT DF_UserAccountID DEFAULT NEWID(),

    Username VARCHAR(64) NOT NULL,

    FirstName NVARCHAR(128) NOT NULL,

    LastName NVARCHAR(128) NOT NULL,

    Email VARCHAR(128) NOT NULL,

    CreatedAt DATETIME NOT NULL
        CONSTRAINT DF_UserAccount_CreatedAt DEFAULT GETDATE(),

    UpdatedAt DATETIME,

    DateOfBirth DATE NOT NULL,

    RowVersion ROWVERSION,

    CONSTRAINT PK_UserAccount
        PRIMARY KEY (UserAccountID),

    CONSTRAINT AK_Username
        UNIQUE (Username),

    CONSTRAINT AK_Email
        UNIQUE (Email)
);


