using AgriSmart.Tools.Entities;

namespace AgriSmart.Tools.DataModels
{
    public class InputPresentationModel: BaseModel
    {
        public int CatalogId { get; set; }
        public int MeasurementUnitId { get; set; }
        public string Description { get; set; }
        public double Quantity { get; set; }

        public InputPresentationModel()
        {
        }

        public InputPresentationModel(InputPresentationEntity model)
        {
            this.CopyPropertiesFrom(model);
        }
    }
}
