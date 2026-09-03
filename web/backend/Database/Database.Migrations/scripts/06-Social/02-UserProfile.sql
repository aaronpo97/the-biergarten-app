CREATE TABLE Social.UserProfile
(
    UserProfileID UNIQUEIDENTIFIER
        CONSTRAINT DF_UserProfileID DEFAULT NEWID(),

    Biography     NVARCHAR(MAX) NOT NULL,

    UserAccountID UNIQUEIDENTIFIER NOT NULL,

    RowVersion    ROWVERSION,

    CONSTRAINT PK_UserProfile
        PRIMARY KEY (UserProfileID),

    CONSTRAINT AK_UserProfile_UserAccountID
        UNIQUE (UserAccountID),

    CONSTRAINT FK_UserProfile_UserAccount
        FOREIGN KEY (UserAccountID)
            REFERENCES Auth.UserAccount (UserAccountID)
            ON DELETE CASCADE
);
