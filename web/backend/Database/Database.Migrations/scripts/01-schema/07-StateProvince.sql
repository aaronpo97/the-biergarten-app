CREATE TABLE StateProvince
(
    StateProvinceID UNIQUEIDENTIFIER
        CONSTRAINT DF_StateProvinceID DEFAULT NEWID(),

    StateProvinceName NVARCHAR(100) NOT NULL,

    ISO3166_2 CHAR(6) NOT NULL,
    -- eg 'US-CA' for California, 'CA-ON' for Ontario

    CountryID UNIQUEIDENTIFIER NOT NULL,

    RowVersion ROWVERSION,

    CONSTRAINT PK_StateProvince
        PRIMARY KEY (StateProvinceID),

    CONSTRAINT AK_StateProvince_ISO3166_2
        UNIQUE (ISO3166_2),

    CONSTRAINT FK_StateProvince_Country
        FOREIGN KEY (CountryID)
            REFERENCES Country (CountryID)
);

CREATE
NONCLUSTERED INDEX IX_StateProvince_Country
    ON StateProvince(CountryID);
