CREATE TABLE Brewery.BreweryPostLocation
(
    BreweryPostLocationID UNIQUEIDENTIFIER
        CONSTRAINT DF_BreweryPostLocationID DEFAULT NEWID(),

    BreweryPostID UNIQUEIDENTIFIER NOT NULL,

    AddressLine1 NVARCHAR(256) NOT NULL,

    AddressLine2 NVARCHAR(256),

    PostalCode NVARCHAR(20) NOT NULL,

    CityID UNIQUEIDENTIFIER NOT NULL,

    Coordinates GEOGRAPHY NULL,

    RowVersion ROWVERSION,

    CONSTRAINT PK_BreweryPostLocation
        PRIMARY KEY (BreweryPostLocationID),

    CONSTRAINT AK_BreweryPostLocation_BreweryPostID
        UNIQUE (BreweryPostID),

    CONSTRAINT FK_BreweryPostLocation_BreweryPost
        FOREIGN KEY (BreweryPostID)
            REFERENCES Brewery.BreweryPost (BreweryPostID)
            ON DELETE CASCADE,

    CONSTRAINT FK_BreweryPostLocation_City
        FOREIGN KEY (CityID)
            REFERENCES Geolocation.City (CityID)
);

CREATE
NONCLUSTERED INDEX IX_BreweryPostLocation_BreweryPost
    ON Brewery.BreweryPostLocation(BreweryPostID);

CREATE
NONCLUSTERED INDEX IX_BreweryPostLocation_City
    ON Brewery.BreweryPostLocation(CityID);

CREATE SPATIAL INDEX SIDX_BreweryPostLocation_Coordinates
    ON Brewery.BreweryPostLocation(Coordinates)
    USING GEOGRAPHY_GRID
    WITH (
        GRIDS = (LEVEL_1 = MEDIUM, LEVEL_2 = MEDIUM, LEVEL_3 = MEDIUM, LEVEL_4 = MEDIUM),
        CELLS_PER_OBJECT = 16
    );
