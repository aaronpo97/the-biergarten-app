CREATE TABLE UserCredential -- delete credentials when user account is deleted
(
    UserCredentialID UNIQUEIDENTIFIER
        CONSTRAINT DF_UserCredentialID DEFAULT NEWID(),

    UserAccountID UNIQUEIDENTIFIER NOT NULL,

    CreatedAt DATETIME NOT NULL
        CONSTRAINT DF_UserCredential_CreatedAt DEFAULT GETDATE(),

    Expiry DATETIME NOT NULL
        CONSTRAINT DF_UserCredential_Expiry DEFAULT DATEADD(DAY, 90, GETDATE()),

    Hash NVARCHAR(256) NOT NULL,
    -- uses argon2

    IsRevoked BIT NOT NULL
        CONSTRAINT DF_UserCredential_IsRevoked DEFAULT 0,

    RevokedAt DATETIME NULL,

    RowVersion ROWVERSION,

    CONSTRAINT PK_UserCredential
        PRIMARY KEY (UserCredentialID),

    CONSTRAINT FK_UserCredential_UserAccount
        FOREIGN KEY (UserAccountID)
            REFERENCES UserAccount (UserAccountID)
            ON DELETE CASCADE
);

CREATE
NONCLUSTERED INDEX IX_UserCredential_UserAccount
    ON UserCredential(UserAccountID);

CREATE
NONCLUSTERED INDEX IX_UserCredential_Account_Active
    ON UserCredential(UserAccountID, IsRevoked, Expiry)
    INCLUDE (Hash);
