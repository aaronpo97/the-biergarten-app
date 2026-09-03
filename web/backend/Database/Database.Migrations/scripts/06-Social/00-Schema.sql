IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Social')
    EXEC('CREATE SCHEMA Social');
