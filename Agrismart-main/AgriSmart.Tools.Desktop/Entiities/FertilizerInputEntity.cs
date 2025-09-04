using AgriSmart.Tools.DataModels;

namespace AgriSmart.Tools.Entities
{
    public class FertilizerInputEntity : BaseEntity
    {
        public int CatalogId { get; set; }

        private int _inputPresentationId;
        public int InputPresentationId { get => _inputPresentationId; set { _inputPresentationId = value; OnPropertyChanged(); } }
        public InputPresentationEntity InputPresentation { get; set; }

        private int _fertilizerId;
        public int FertilizerId { get => _fertilizerId; set { _fertilizerId = value; OnPropertyChanged(); } }
        public FertilizerEntity Fertilizer { get; set; }

        private double _price;
        public double Price { get => _price; set { _price = value; OnPropertyChanged(); } }
        public bool Selected { get; set; } = false;
        public double Amount { get; set; } = 0;

        public FertilizerInputEntity()
        {
        }

        public FertilizerInputEntity(FertilizerInputModel fertilizerInputModel, FertilizerEntity fertilizer, InputPresentationEntity inputPresentation)
        {
            this.CopyPropertiesFrom(fertilizerInputModel);
            Fertilizer = fertilizer;
            fertilizer.FertilizerInput = this;
            InputPresentation = inputPresentation;
        }

    }
}
