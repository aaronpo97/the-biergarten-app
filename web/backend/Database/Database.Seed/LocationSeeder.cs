using System.Data;
using Microsoft.Data.SqlClient;

namespace Database.Seed;

/// <summary>
///     Seeds the location hierarchy (countries, states/provinces, and cities) used to
///     associate other entities (e.g. breweries, users) with a geographic location.
///     Countries must be seeded before states/provinces, which must be seeded before
///     cities, since each level references its parent by code. The underlying stored
///     procedures (<c>USP_CreateCountry</c>, <c>USP_CreateStateProvince</c>,
///     <c>USP_CreateCity</c>) are expected to be idempotent, so re-running this seeder
///     against an already-seeded database is safe.
/// </summary>
internal class LocationSeeder : ISeeder
{
    /// <summary>The set of countries to seed, identified by name and ISO 3166-1 code.</summary>
    private static readonly IReadOnlyList<(string CountryName, string CountryCode)> Countries =
    [
        ("Canada", "CA"),
        ("Mexico", "MX"),
        ("United States", "US"),
    ];

    /// <summary>
    ///     The set of states/provinces to seed, each identified by name, ISO 3166-2 code,
    ///     and the ISO 3166-1 code of its parent country.
    /// </summary>
    private static IReadOnlyList<(
        string StateProvinceName,
        string StateProvinceCode,
        string CountryCode
    )> States { get; } =
    [
        ("Alabama", "US-AL", "US"),
        ("Alaska", "US-AK", "US"),
        ("Arizona", "US-AZ", "US"),
        ("Arkansas", "US-AR", "US"),
        ("California", "US-CA", "US"),
        ("Colorado", "US-CO", "US"),
        ("Connecticut", "US-CT", "US"),
        ("Delaware", "US-DE", "US"),
        ("Florida", "US-FL", "US"),
        ("Georgia", "US-GA", "US"),
        ("Hawaii", "US-HI", "US"),
        ("Idaho", "US-ID", "US"),
        ("Illinois", "US-IL", "US"),
        ("Indiana", "US-IN", "US"),
        ("Iowa", "US-IA", "US"),
        ("Kansas", "US-KS", "US"),
        ("Kentucky", "US-KY", "US"),
        ("Louisiana", "US-LA", "US"),
        ("Maine", "US-ME", "US"),
        ("Maryland", "US-MD", "US"),
        ("Massachusetts", "US-MA", "US"),
        ("Michigan", "US-MI", "US"),
        ("Minnesota", "US-MN", "US"),
        ("Mississippi", "US-MS", "US"),
        ("Missouri", "US-MO", "US"),
        ("Montana", "US-MT", "US"),
        ("Nebraska", "US-NE", "US"),
        ("Nevada", "US-NV", "US"),
        ("New Hampshire", "US-NH", "US"),
        ("New Jersey", "US-NJ", "US"),
        ("New Mexico", "US-NM", "US"),
        ("New York", "US-NY", "US"),
        ("North Carolina", "US-NC", "US"),
        ("North Dakota", "US-ND", "US"),
        ("Ohio", "US-OH", "US"),
        ("Oklahoma", "US-OK", "US"),
        ("Oregon", "US-OR", "US"),
        ("Pennsylvania", "US-PA", "US"),
        ("Rhode Island", "US-RI", "US"),
        ("South Carolina", "US-SC", "US"),
        ("South Dakota", "US-SD", "US"),
        ("Tennessee", "US-TN", "US"),
        ("Texas", "US-TX", "US"),
        ("Utah", "US-UT", "US"),
        ("Vermont", "US-VT", "US"),
        ("Virginia", "US-VA", "US"),
        ("Washington", "US-WA", "US"),
        ("West Virginia", "US-WV", "US"),
        ("Wisconsin", "US-WI", "US"),
        ("Wyoming", "US-WY", "US"),
        ("District of Columbia", "US-DC", "US"),
        ("Puerto Rico", "US-PR", "US"),
        ("U.S. Virgin Islands", "US-VI", "US"),
        ("Guam", "US-GU", "US"),
        ("Northern Mariana Islands", "US-MP", "US"),
        ("American Samoa", "US-AS", "US"),
        ("Ontario", "CA-ON", "CA"),
        ("Québec", "CA-QC", "CA"),
        ("Nova Scotia", "CA-NS", "CA"),
        ("New Brunswick", "CA-NB", "CA"),
        ("Manitoba", "CA-MB", "CA"),
        ("British Columbia", "CA-BC", "CA"),
        ("Prince Edward Island", "CA-PE", "CA"),
        ("Saskatchewan", "CA-SK", "CA"),
        ("Alberta", "CA-AB", "CA"),
        ("Newfoundland and Labrador", "CA-NL", "CA"),
        ("Northwest Territories", "CA-NT", "CA"),
        ("Yukon", "CA-YT", "CA"),
        ("Nunavut", "CA-NU", "CA"),
        ("Aguascalientes", "MX-AGU", "MX"),
        ("Baja California", "MX-BCN", "MX"),
        ("Baja California Sur", "MX-BCS", "MX"),
        ("Campeche", "MX-CAM", "MX"),
        ("Chiapas", "MX-CHP", "MX"),
        ("Chihuahua", "MX-CHH", "MX"),
        ("Coahuila de Zaragoza", "MX-COA", "MX"),
        ("Colima", "MX-COL", "MX"),
        ("Durango", "MX-DUR", "MX"),
        ("Guanajuato", "MX-GUA", "MX"),
        ("Guerrero", "MX-GRO", "MX"),
        ("Hidalgo", "MX-HID", "MX"),
        ("Jalisco", "MX-JAL", "MX"),
        ("México State", "MX-MEX", "MX"),
        ("Michoacán de Ocampo", "MX-MIC", "MX"),
        ("Morelos", "MX-MOR", "MX"),
        ("Nayarit", "MX-NAY", "MX"),
        ("Nuevo León", "MX-NLE", "MX"),
        ("Oaxaca", "MX-OAX", "MX"),
        ("Puebla", "MX-PUE", "MX"),
        ("Querétaro", "MX-QUE", "MX"),
        ("Quintana Roo", "MX-ROO", "MX"),
        ("San Luis Potosí", "MX-SLP", "MX"),
        ("Sinaloa", "MX-SIN", "MX"),
        ("Sonora", "MX-SON", "MX"),
        ("Tabasco", "MX-TAB", "MX"),
        ("Tamaulipas", "MX-TAM", "MX"),
        ("Tlaxcala", "MX-TLA", "MX"),
        ("Veracruz de Ignacio de la Llave", "MX-VER", "MX"),
        ("Yucatán", "MX-YUC", "MX"),
        ("Zacatecas", "MX-ZAC", "MX"),
        ("Ciudad de México", "MX-CMX", "MX"),
    ];

    /// <summary>
    ///     The set of cities to seed, each identified by name and the ISO 3166-2 code of its
    ///     parent state/province.
    /// </summary>
    private static IReadOnlyList<(string StateProvinceCode, string CityName)> Cities { get; } =
    [
        ("US-CA", "Los Angeles"),
        ("US-CA", "San Diego"),
        ("US-CA", "San Francisco"),
        ("US-CA", "Sacramento"),
        ("US-TX", "Houston"),
        ("US-TX", "Dallas"),
        ("US-TX", "Austin"),
        ("US-TX", "San Antonio"),
        ("US-FL", "Miami"),
        ("US-FL", "Orlando"),
        ("US-FL", "Tampa"),
        ("US-NY", "New York"),
        ("US-NY", "Buffalo"),
        ("US-NY", "Rochester"),
        ("US-IL", "Chicago"),
        ("US-IL", "Springfield"),
        ("US-PA", "Philadelphia"),
        ("US-PA", "Pittsburgh"),
        ("US-AZ", "Phoenix"),
        ("US-AZ", "Tucson"),
        ("US-CO", "Denver"),
        ("US-CO", "Colorado Springs"),
        ("US-MA", "Boston"),
        ("US-MA", "Worcester"),
        ("US-WA", "Seattle"),
        ("US-WA", "Spokane"),
        ("US-GA", "Atlanta"),
        ("US-GA", "Savannah"),
        ("US-NV", "Las Vegas"),
        ("US-NV", "Reno"),
        ("US-MI", "Detroit"),
        ("US-MI", "Grand Rapids"),
        ("US-MN", "Minneapolis"),
        ("US-MN", "Saint Paul"),
        ("US-OH", "Columbus"),
        ("US-OH", "Cleveland"),
        ("US-OR", "Portland"),
        ("US-OR", "Salem"),
        ("US-TN", "Nashville"),
        ("US-TN", "Memphis"),
        ("US-VA", "Richmond"),
        ("US-VA", "Virginia Beach"),
        ("US-MD", "Baltimore"),
        ("US-MD", "Frederick"),
        ("US-DC", "Washington"),
        ("US-UT", "Salt Lake City"),
        ("US-UT", "Provo"),
        ("US-LA", "New Orleans"),
        ("US-LA", "Baton Rouge"),
        ("US-KY", "Louisville"),
        ("US-KY", "Lexington"),
        ("US-IA", "Des Moines"),
        ("US-IA", "Cedar Rapids"),
        ("US-OK", "Oklahoma City"),
        ("US-OK", "Tulsa"),
        ("US-NE", "Omaha"),
        ("US-NE", "Lincoln"),
        ("US-MO", "Kansas City"),
        ("US-MO", "St. Louis"),
        ("US-NC", "Charlotte"),
        ("US-NC", "Raleigh"),
        ("US-SC", "Columbia"),
        ("US-SC", "Charleston"),
        ("US-WI", "Milwaukee"),
        ("US-WI", "Madison"),
        ("US-MN", "Duluth"),
        ("US-AK", "Anchorage"),
        ("US-HI", "Honolulu"),
        ("CA-ON", "Toronto"),
        ("CA-ON", "Ottawa"),
        ("CA-QC", "Montréal"),
        ("CA-QC", "Québec City"),
        ("CA-BC", "Vancouver"),
        ("CA-BC", "Victoria"),
        ("CA-AB", "Calgary"),
        ("CA-AB", "Edmonton"),
        ("CA-MB", "Winnipeg"),
        ("CA-NS", "Halifax"),
        ("CA-SK", "Saskatoon"),
        ("CA-SK", "Regina"),
        ("CA-NB", "Moncton"),
        ("CA-NB", "Saint John"),
        ("CA-PE", "Charlottetown"),
        ("CA-NL", "St. John's"),
        ("CA-ON", "Hamilton"),
        ("CA-ON", "London"),
        ("CA-QC", "Gatineau"),
        ("CA-QC", "Laval"),
        ("CA-BC", "Kelowna"),
        ("CA-AB", "Red Deer"),
        ("CA-MB", "Brandon"),
        ("MX-CMX", "Ciudad de México"),
        ("MX-JAL", "Guadalajara"),
        ("MX-NLE", "Monterrey"),
        ("MX-PUE", "Puebla"),
        ("MX-ROO", "Cancún"),
        ("MX-GUA", "Guanajuato"),
        ("MX-MIC", "Morelia"),
        ("MX-BCN", "Tijuana"),
        ("MX-JAL", "Zapopan"),
        ("MX-NLE", "San Nicolás"),
        ("MX-CAM", "Campeche"),
        ("MX-TAB", "Villahermosa"),
        ("MX-VER", "Veracruz"),
        ("MX-OAX", "Oaxaca"),
        ("MX-SLP", "San Luis Potosí"),
        ("MX-CHH", "Chihuahua"),
        ("MX-AGU", "Aguascalientes"),
        ("MX-MEX", "Toluca"),
        ("MX-COA", "Saltillo"),
        ("MX-BCS", "La Paz"),
        ("MX-NAY", "Tepic"),
        ("MX-ZAC", "Zacatecas"),
    ];

    /// <summary>
    ///     Seeds all countries, then states/provinces, then cities, in that order, so that
    ///     each level's parent reference already exists by the time it is created.
    /// </summary>
    /// <param name="connection">An open connection to the target database.</param>
    /// <returns>A task that completes when all locations have been seeded.</returns>
    public async Task SeedAsync(SqlConnection connection)
    {
        foreach ((string countryName, string countryCode) in Countries)
            await CreateCountryAsync(connection, countryName, countryCode);

        foreach ((string stateProvinceName, string stateProvinceCode, string countryCode) in States)
            await CreateStateProvinceAsync(
                connection,
                stateProvinceName,
                stateProvinceCode,
                countryCode
            );

        foreach ((string stateProvinceCode, string cityName) in Cities)
            await CreateCityAsync(connection, cityName, stateProvinceCode);
    }

    /// <summary>Creates a single country by invoking the <c>dbo.USP_CreateCountry</c> stored procedure.</summary>
    /// <param name="connection">An open connection to the target database.</param>
    /// <param name="countryName">The display name of the country.</param>
    /// <param name="countryCode">The ISO 3166-1 code of the country.</param>
    /// <returns>A task that completes when the country has been created.</returns>
    private static async Task CreateCountryAsync(
        SqlConnection connection,
        string countryName,
        string countryCode
    )
    {
        await using SqlCommand command = new("dbo.USP_CreateCountry", connection);
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.AddWithValue("@CountryName", countryName);
        command.Parameters.AddWithValue("@ISO3166_1", countryCode);

        await command.ExecuteNonQueryAsync();
    }

    /// <summary>Creates a single state/province by invoking the <c>dbo.USP_CreateStateProvince</c> stored procedure.</summary>
    /// <param name="connection">An open connection to the target database.</param>
    /// <param name="stateProvinceName">The display name of the state/province.</param>
    /// <param name="stateProvinceCode">The ISO 3166-2 code of the state/province.</param>
    /// <param name="countryCode">The ISO 3166-1 code of the parent country, which must already exist.</param>
    /// <returns>A task that completes when the state/province has been created.</returns>
    private static async Task CreateStateProvinceAsync(
        SqlConnection connection,
        string stateProvinceName,
        string stateProvinceCode,
        string countryCode
    )
    {
        await using SqlCommand command = new("dbo.USP_CreateStateProvince", connection);
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.AddWithValue("@StateProvinceName", stateProvinceName);
        command.Parameters.AddWithValue("@ISO3166_2", stateProvinceCode);
        command.Parameters.AddWithValue("@CountryCode", countryCode);

        await command.ExecuteNonQueryAsync();
    }

    /// <summary>Creates a single city by invoking the <c>dbo.USP_CreateCity</c> stored procedure.</summary>
    /// <param name="connection">An open connection to the target database.</param>
    /// <param name="cityName">The display name of the city.</param>
    /// <param name="stateProvinceCode">The ISO 3166-2 code of the parent state/province, which must already exist.</param>
    /// <returns>A task that completes when the city has been created.</returns>
    private static async Task CreateCityAsync(
        SqlConnection connection,
        string cityName,
        string stateProvinceCode
    )
    {
        await using SqlCommand command = new("dbo.USP_CreateCity", connection);
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.AddWithValue("@CityName", cityName);
        command.Parameters.AddWithValue("@StateProvinceCode", stateProvinceCode);

        await command.ExecuteNonQueryAsync();
    }
}
