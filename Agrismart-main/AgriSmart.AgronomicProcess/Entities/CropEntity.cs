using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Entities
{
    public record CropEntity
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public double CropBaseTemperature { get; set; } = 10;
        public bool Active { get; set; }
        public CropEntity(Crop model)
        {
            this.CopyPropertiesFrom(model);
        }
    }
}