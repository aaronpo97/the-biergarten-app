namespace Domain.Entities;

public sealed class City
{
    // PK
    public Guid CityId { get; set; }

    // FK References
    public Guid StateProvinceId { get; set; }

    // Attributes
    public string CityName { get; set; } = string.Empty;

    // Audit Fields
    public byte[]? RowVersion { get; set; }

    // Navigation Properties
    public StateProvince? StateProvince { get; set; }
}
