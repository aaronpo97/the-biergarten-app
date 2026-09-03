CREATE TABLE Beer.BeerPost
(
    BeerPostID UNIQUEIDENTIFIER
        CONSTRAINT DF_BeerPostID DEFAULT NEWID(),

    Name NVARCHAR(100) NOT NULL,

    Description NVARCHAR(MAX) NOT NULL,

    ABV DECIMAL(4, 2) NOT NULL,
    -- Alcohol By Volume (typically 0-67%)

    IBU INT NOT NULL,
    -- International Bitterness Units (typically 0-120)

    PostedByID UNIQUEIDENTIFIER NOT NULL,

    BeerStyleID UNIQUEIDENTIFIER NOT NULL,

    BrewedByID UNIQUEIDENTIFIER NOT NULL,

    CreatedAt DATETIME NOT NULL
        CONSTRAINT DF_BeerPost_CreatedAt DEFAULT GETDATE(),

    UpdatedAt DATETIME,

    RowVersion ROWVERSION,

    CONSTRAINT PK_BeerPost
        PRIMARY KEY (BeerPostID),

    CONSTRAINT FK_BeerPost_PostedBy
        FOREIGN KEY (PostedByID)
            REFERENCES Auth.UserAccount (UserAccountID)
            ON DELETE NO ACTION,

    CONSTRAINT FK_BeerPost_BeerStyle
        FOREIGN KEY (BeerStyleID)
            REFERENCES Beer.BeerStyle (BeerStyleID),

    CONSTRAINT FK_BeerPost_Brewery
        FOREIGN KEY (BrewedByID)
            REFERENCES Brewery.BreweryPost (BreweryPostID),

    CONSTRAINT CHK_BeerPost_ABV
        CHECK (ABV >= 0 AND ABV <= 67),

    CONSTRAINT CHK_BeerPost_IBU
        CHECK (IBU >= 0 AND IBU <= 120)
);

CREATE
NONCLUSTERED INDEX IX_BeerPost_PostedBy
    ON Beer.BeerPost(PostedByID);

CREATE
NONCLUSTERED INDEX IX_BeerPost_BeerStyle
    ON Beer.BeerPost(BeerStyleID);

CREATE
NONCLUSTERED INDEX IX_BeerPost_BrewedBy
    ON Beer.BeerPost(BrewedByID);
