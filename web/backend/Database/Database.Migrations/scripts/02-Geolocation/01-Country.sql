CREATE TABLE Geolocation.Country
(
    CountryID UNIQUEIDENTIFIER
        CONSTRAINT DF_CountryID DEFAULT NEWID(),

    CountryName NVARCHAR(100) NOT NULL,

    ISO3166_1 CHAR(2) NOT NULL,

    RowVersion ROWVERSION,

    CONSTRAINT PK_Country
        PRIMARY KEY (CountryID),

    CONSTRAINT AK_Country_ISO3166_1
        UNIQUE (ISO3166_1)
);
