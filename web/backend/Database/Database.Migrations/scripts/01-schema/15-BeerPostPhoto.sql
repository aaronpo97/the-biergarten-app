CREATE TABLE BeerPostPhoto -- All photos linked to a beer post are deleted if the post is deleted
(
    BeerPostPhotoID UNIQUEIDENTIFIER
        CONSTRAINT DF_BeerPostPhotoID DEFAULT NEWID(),

    BeerPostID UNIQUEIDENTIFIER NOT NULL,

    PhotoID UNIQUEIDENTIFIER NOT NULL,

    LinkedAt DATETIME NOT NULL
        CONSTRAINT DF_BeerPostPhoto_LinkedAt DEFAULT GETDATE(),

    RowVersion ROWVERSION,

    CONSTRAINT PK_BeerPostPhoto
        PRIMARY KEY (BeerPostPhotoID),

    CONSTRAINT FK_BeerPostPhoto_BeerPost
        FOREIGN KEY (BeerPostID)
            REFERENCES BeerPost (BeerPostID)
            ON DELETE CASCADE,

    CONSTRAINT FK_BeerPostPhoto_Photo
        FOREIGN KEY (PhotoID)
            REFERENCES Photo (PhotoID)
            ON DELETE CASCADE
);

CREATE
NONCLUSTERED INDEX IX_BeerPostPhoto_Photo_BeerPost
    ON BeerPostPhoto(PhotoID, BeerPostID);

CREATE
NONCLUSTERED INDEX IX_BeerPostPhoto_BeerPost_Photo
    ON BeerPostPhoto(BeerPostID, PhotoID);
