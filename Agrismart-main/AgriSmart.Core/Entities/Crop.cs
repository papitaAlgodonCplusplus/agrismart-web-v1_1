namespace AgriSmart.Core.Entities
{
    public class Crop : BaseEntity
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public double CropBaseTemperature { get; set; }
        public bool Active { get; set; }
    }
}