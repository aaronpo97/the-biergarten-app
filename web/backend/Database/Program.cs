namespace Database.Seed;

public interface IExportDatabase
{
    void SeedLocations(IEnumerable<Location> locations);
    void SeedUsers(IEnumerable<User> users);

    void SeedBreweries(IEnumerable<Brewery> breweries);
}

public interface IImportDatabase
{
    IEnumerable<Location> GetLocations();
    IEnumerable<User> GetUsers();

    IEnumerable<Brewery> GetBreweries();
}
