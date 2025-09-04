using AgriSmart.Tools.DataModels;

namespace AgriSmart.Tools.Entities
{
    public class InputPresentationEntity : BaseEntity
    {
        public int CatalogId { get; set; }

        private int _measurementUnitId;
        public int MeasurementUnitId { get => _measurementUnitId; set { _measurementUnitId = value; OnPropertyChanged(); } }
        public MeasurementUnitEntity MeasurementUnit { get; set; }
        
        private string _description;
        public string Description { get => _description; set { _description = value; OnPropertyChanged(); } }

        private double _quantity;
        public double Quantity { get => _quantity; set { _quantity = value; OnPropertyChanged(); } }
        public string MeasurementUnitName { get { return MeasurementUnit.Name; } }

        public InputPresentationEntity()
        {

        }

        public InputPresentationEntity(InputPresentationModel model, MeasurementUnitEntity measurementUnit)
        {
            this.CopyPropertiesFrom(model);
            MeasurementUnit = measurementUnit;
        }
    }
}


