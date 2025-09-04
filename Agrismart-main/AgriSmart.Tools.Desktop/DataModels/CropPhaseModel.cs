namespace AgriSmart.Tools.DataModels
{
    public class CropPhaseModel: BaseModel
    {
        public int CatalogId { get; set; }
        public int CropId { get; set; }
        public int Sequence { get; set; }
        public string Description { get; set; }
        public int StartingWeek { get; set; }
        public int EndingWeek { get; set; }

        public CropPhaseModel()
        {

        }

        public CropPhaseModel(int id, int idCatalogs, int idCrop, int sequence, string name, string description, int startingWeek, int endingWeek)
        {
            Id = id;
            CatalogId = idCatalogs;
            CropId = idCrop;
            Sequence = sequence;
            Name = name;
            Description = description;
            StartingWeek = startingWeek;
            EndingWeek = endingWeek;
        }
    }
}
