namespace Database.Seed.SourceDataModels;

public sealed record PostalCodeSpec(
    string CountryFormatRegex,
    IReadOnlyList<string> CityRegexes
);

public sealed class City
{
    // Identity
    public int Id { get; init; }

    // Attributes
    public string CityName { get; init; } = string.Empty;

    // Resharper disable InconsistentNaming
    public string ISO_3166_1 { get; init; } = string.Empty;
    public string ISO_3166_2 { get; init; } = string.Empty;
    public string CountryName { get; init; } = string.Empty;
    public string StateProvinceName { get; init; } = string.Empty;

    public double Longitude { get; init; }
    public double Latitude { get; init; }

    public IReadOnlyList<string> LocalLanguages { get; init; } = [];
    public PostalCodeSpec? PostalCode { get; init; }
}

public sealed class BreweryAddress
{
    // Identity
    public int Id { get; init; }

    // FK References
    public int CityId { get; init; }
    public int BreweryId { get; init; } // FK lives on this side in the DB (brewery_addresses.brewery_id)

    // Attributes
    public double Longitude { get; init; }
    public double Latitude { get; init; }
    public string AddressLine1 { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;

    // Navigation properties
    public City? City { get; init; }
    public BreweryResult? Brewery { get; init; }
}

public sealed class BreweryResult
{
    // Identity
    public int Id { get; init; }

    // Attributes
    public string NameEn { get; init; } = string.Empty;
    public string DescriptionEn { get; init; } = string.Empty;
    public string NameLocal { get; init; } = string.Empty;
    public string DescriptionLocal { get; init; } = string.Empty;

    // Navigation properties
    public BreweryAddress? Address { get; init; }
}

public sealed class UserAddress
{
    // Identity
    public int Id { get; init; }

    // FK References
    public int CityId { get; init; }
    public int UserId { get; init; }

    // Attributes
    public double Longitude { get; init; }
    public double Latitude { get; init; }

    // Navigation properties
    public City? City { get; init; }
}

public sealed class UserResult
{
    // Identity
    public int Id { get; init; }

    // Attributes
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Gender { get; init; } = string.Empty;
    public string Username { get; init; } = string.Empty;
    public string Bio { get; init; } = string.Empty;
    public float ActivityWeight { get; init; }
}

public sealed class UserRecord
{
    // Attributes
    public string Email { get; init; } = string.Empty;
    public string DateOfBirth { get; init; } = string.Empty;

    // Navigation properties
    public UserAddress Address { get; init; } = new();
    public UserResult User { get; init; } = new();
}
