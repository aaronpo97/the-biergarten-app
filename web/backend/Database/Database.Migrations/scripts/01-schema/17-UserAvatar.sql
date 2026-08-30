CREATE TABLE dbo.UserAvatar
(
    UserAvatarID  UNIQUEIDENTIFIER
        CONSTRAINT DF_UserAvatarID DEFAULT NEWID(),

    UserProfileID UNIQUEIDENTIFIER NOT NULL,

    PhotoID       UNIQUEIDENTIFIER NOT NULL,

    ValidFrom     DATETIME2(3)     NOT NULL
        CONSTRAINT DF_UserAvatar_ValidFrom DEFAULT SYSUTCDATETIME(),

    ValidTo       DATETIME2(3)     NULL, -- NULL = currently active

    RowVersion    ROWVERSION,

    CONSTRAINT PK_UserAvatar PRIMARY KEY (UserAvatarID),

    CONSTRAINT FK_UserAvatar_UserProfile
        FOREIGN KEY (UserProfileID)
            REFERENCES dbo.UserProfile (UserProfileID)
            ON DELETE CASCADE,

    CONSTRAINT FK_UserAvatar_Photo
        FOREIGN KEY (PhotoID)
            REFERENCES dbo.Photo (PhotoID)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,

    CONSTRAINT CK_UserAvatar_ValidRange
        CHECK (ValidTo IS NULL OR ValidTo > ValidFrom)
);

-- At most one active avatar per profile
CREATE UNIQUE NONCLUSTERED INDEX UX_UserAvatar_ActiveOne
    ON dbo.UserAvatar (UserProfileID)
    WHERE ValidTo IS NULL;

CREATE NONCLUSTERED INDEX IX_UserAvatar_Photo
    ON dbo.UserAvatar (PhotoID);

CREATE NONCLUSTERED INDEX ix_UserAvatar_Profile
    ON dbo.UserAvatar (UserProfileID)
