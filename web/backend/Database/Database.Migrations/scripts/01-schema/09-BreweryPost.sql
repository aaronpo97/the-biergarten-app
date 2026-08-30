CREATE TABLE BreweryPost -- A user cannot be deleted if they have a post
(
    BreweryPostID UNIQUEIDENTIFIER
        CONSTRAINT DF_BreweryPostID DEFAULT NEWID(),

    BreweryName NVARCHAR(256) NOT NULL,

    PostedByID UNIQUEIDENTIFIER NOT NULL,

    Description NVARCHAR(MAX) NOT NULL,

    CreatedAt DATETIME NOT NULL
        CONSTRAINT DF_BreweryPost_CreatedAt DEFAULT GETDATE(),

    UpdatedAt DATETIME NULL,

    RowVersion ROWVERSION,

    CONSTRAINT PK_BreweryPost
        PRIMARY KEY (BreweryPostID),

    CONSTRAINT FK_BreweryPost_UserAccount
        FOREIGN KEY (PostedByID)
            REFERENCES UserAccount (UserAccountID)
            ON DELETE NO ACTION
);

CREATE
NONCLUSTERED INDEX IX_BreweryPost_PostedByID
    ON BreweryPost(PostedByID);
