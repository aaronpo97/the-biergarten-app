CREATE TABLE Beer.BeerPostComment
(
    BeerPostCommentID UNIQUEIDENTIFIER
        CONSTRAINT DF_BeerPostComment DEFAULT NEWID(),

    Comment NVARCHAR(250) NOT NULL,

    BeerPostID UNIQUEIDENTIFIER NOT NULL,

    CommentedByID UNIQUEIDENTIFIER NOT NULL,

    Rating INT NOT NULL,

    CreatedAt DATETIME NOT NULL
        CONSTRAINT DF_BeerPostComment_CreatedAt DEFAULT GETDATE(),

    UpdatedAt DATETIME NULL,

    RowVersion ROWVERSION,

    CONSTRAINT PK_BeerPostComment
        PRIMARY KEY (BeerPostCommentID),

    CONSTRAINT FK_BeerPostComment_BeerPost
        FOREIGN KEY (BeerPostID)
            REFERENCES Beer.BeerPost (BeerPostID),

    CONSTRAINT FK_BeerPostComment_UserAccount
        FOREIGN KEY (CommentedByID)
            REFERENCES Auth.UserAccount (UserAccountID)
            ON DELETE NO ACTION,

    CONSTRAINT CHK_BeerPostComment_Rating
        CHECK (Rating BETWEEN 1 AND 5)
);

CREATE
NONCLUSTERED INDEX IX_BeerPostComment_BeerPost
    ON Beer.BeerPostComment(BeerPostID);

CREATE
NONCLUSTERED INDEX IX_BeerPostComment_CommentedBy
    ON Beer.BeerPostComment(CommentedByID);
