namespace Domain.Entities;

public class City
{
    public Guid CityId { get; set; }
    public string CityName { get; set; } = string.Empty;
    public Guid StateProvinceId { get; set; }
}
