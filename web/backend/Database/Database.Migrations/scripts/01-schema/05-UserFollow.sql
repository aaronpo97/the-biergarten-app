CREATE TABLE UserFollow
(
    UserFollowID UNIQUEIDENTIFIER
        CONSTRAINT DF_UserFollowID DEFAULT NEWID(),

    UserAccountID UNIQUEIDENTIFIER NOT NULL,

    FollowingID UNIQUEIDENTIFIER NOT NULL,

    CreatedAt DATETIME NOT NULL
        CONSTRAINT DF_UserFollow_CreatedAt DEFAULT GETDATE(),

    RowVersion ROWVERSION,

    CONSTRAINT PK_UserFollow
        PRIMARY KEY (UserFollowID),

    CONSTRAINT FK_UserFollow_UserAccount
        FOREIGN KEY (UserAccountID)
            REFERENCES UserAccount (UserAccountID)
            ON DELETE NO ACTION,

    CONSTRAINT FK_UserFollow_UserAccountFollowing
        FOREIGN KEY (FollowingID)
            REFERENCES UserAccount (UserAccountID)
            ON DELETE NO ACTION,

    CONSTRAINT CK_CannotFollowOwnAccount
        CHECK (UserAccountID != FollowingID
)
);

CREATE
NONCLUSTERED INDEX IX_UserFollow_UserAccount_FollowingID
    ON UserFollow(UserAccountID, FollowingID);

CREATE
NONCLUSTERED INDEX IX_UserFollow_FollowingID_UserAccount
    ON UserFollow(FollowingID, UserAccountID);
