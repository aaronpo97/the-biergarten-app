CREATE TABLE Brewery.BreweryPostPhoto -- All photos linked to a post are deleted if the post is deleted
(
    BreweryPostPhotoID UNIQUEIDENTIFIER
        CONSTRAINT DF_BreweryPostPhotoID DEFAULT NEWID(),

    BreweryPostID UNIQUEIDENTIFIER NOT NULL,

    PhotoID UNIQUEIDENTIFIER NOT NULL,

    LinkedAt DATETIME NOT NULL
        CONSTRAINT DF_BreweryPostPhoto_LinkedAt DEFAULT GETDATE(),

    RowVersion ROWVERSION,

    CONSTRAINT PK_BreweryPostPhoto
        PRIMARY KEY (BreweryPostPhotoID),

    CONSTRAINT FK_BreweryPostPhoto_BreweryPost
        FOREIGN KEY (BreweryPostID)
            REFERENCES Brewery.BreweryPost (BreweryPostID)
            ON DELETE CASCADE,

    CONSTRAINT FK_BreweryPostPhoto_Photo
        FOREIGN KEY (PhotoID)
            REFERENCES Media.Photo (PhotoID)
            ON DELETE CASCADE
);

CREATE
NONCLUSTERED INDEX IX_BreweryPostPhoto_Photo_BreweryPost
    ON Brewery.BreweryPostPhoto(PhotoID, BreweryPostID);

CREATE
NONCLUSTERED INDEX IX_BreweryPostPhoto_BreweryPost_Photo
    ON Brewery.BreweryPostPhoto(BreweryPostID, PhotoID);
