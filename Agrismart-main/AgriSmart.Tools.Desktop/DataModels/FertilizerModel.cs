using AgriSmart.Tools.DataModels;
using AgriSmart.Tools.Entities;

namespace AgriSmart.Tools.DataModels
{
    public class FertilizerModel: BaseModel
    {
        public int CatalogId { get; set; }
        public string Manufacturer { get; set; }
        public bool IsLiquid { get; set; }

        public FertilizerModel()
        {
        }

        public FertilizerModel(FertilizerEntity model)
        {
            this.CopyPropertiesFrom(model);
        }
    }
}
