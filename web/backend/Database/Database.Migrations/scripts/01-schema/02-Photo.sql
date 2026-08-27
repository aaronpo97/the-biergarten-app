CREATE TABLE Photo -- All photos must be linked to a user account, you cannot delete a user account if they have uploaded photos
(
    PhotoID UNIQUEIDENTIFIER
        CONSTRAINT DF_PhotoID DEFAULT NEWID(),

    Hyperlink NVARCHAR(256),
    -- storage is handled via filesystem or cloud service

    UploadedByID UNIQUEIDENTIFIER NOT NULL,

    UploadedAt DATETIME NOT NULL
        CONSTRAINT DF_Photo_UploadedAt DEFAULT GETDATE(),

    RowVersion ROWVERSION,

    CONSTRAINT PK_Photo
        PRIMARY KEY (PhotoID),

    CONSTRAINT FK_Photo_UploadedBy
        FOREIGN KEY (UploadedByID)
            REFERENCES UserAccount (UserAccountID)
            ON DELETE NO ACTION
);

CREATE
NONCLUSTERED INDEX IX_Photo_UploadedByID
    ON Photo(UploadedByID);
