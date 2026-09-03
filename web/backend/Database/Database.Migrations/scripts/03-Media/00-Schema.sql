IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Media')
    EXEC('CREATE SCHEMA Media');
