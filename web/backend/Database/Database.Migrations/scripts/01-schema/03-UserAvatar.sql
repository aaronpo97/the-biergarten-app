CREATE TABLE UserAvatar -- delete avatar photo when user account is deleted
(
    UserAvatarID UNIQUEIDENTIFIER
        CONSTRAINT DF_UserAvatarID DEFAULT NEWID(),

    UserAccountID UNIQUEIDENTIFIER NOT NULL,

    PhotoID UNIQUEIDENTIFIER NOT NULL,

    RowVersion ROWVERSION,

    CONSTRAINT PK_UserAvatar PRIMARY KEY (UserAvatarID),

    CONSTRAINT FK_UserAvatar_UserAccount
        FOREIGN KEY (UserAccountID)
            REFERENCES UserAccount (UserAccountID)
            ON DELETE CASCADE,

    CONSTRAINT FK_UserAvatar_PhotoID
        FOREIGN KEY (PhotoID)
            REFERENCES Photo (PhotoID),

    CONSTRAINT AK_UserAvatar_UserAccountID
        UNIQUE (UserAccountID)
);

CREATE
NONCLUSTERED INDEX IX_UserAvatar_UserAccount
    ON UserAvatar(UserAccountID);
