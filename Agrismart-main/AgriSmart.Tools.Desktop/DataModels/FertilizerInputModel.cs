using AgriSmart.Tools.Entities;

namespace AgriSmart.Tools.DataModels
{
    public class FertilizerInputModel: BaseModel
    { 
        public int CatalogId { get; set; }
        public int InputPresentationId { get; set; }
        public int FertilizerId { get; set; }
        public double Price { get; set; }

        public FertilizerInputModel() { }
        public FertilizerInputModel(FertilizerInputEntity model)
        {
            this.CopyPropertiesFrom(model);

        }


    }
}
