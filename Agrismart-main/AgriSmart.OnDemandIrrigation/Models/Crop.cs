namespace AgriSmart.OnDemandIrrigation.Models
{
    public record Crop
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public double CropBaseTemperature { get; set; } = 10;//falta en BD
        public bool Active { get; set; }
    }
}