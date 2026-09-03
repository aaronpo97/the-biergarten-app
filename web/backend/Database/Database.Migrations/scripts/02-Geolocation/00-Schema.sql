IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Geolocation')
    EXEC('CREATE SCHEMA Geolocation');
