using AgriSmart.Core.Entities;

namespace AgriSmart.Tools.Entities
{
    public class CropEntity: BaseEntity
    {
        public string Description { get; set; } 
        public double CropBaseTemperature { get; set; } = 10;

        public CropEntity()
        {
        }

        public CropEntity(Crop model)
        {
            Id = model.Id;
            Name = model.Name;
        }
    }
}
