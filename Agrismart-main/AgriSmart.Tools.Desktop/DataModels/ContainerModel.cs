namespace AgriSmart.Tools.DataModels
{
    public class ContainerModel: BaseModel
    {
        public int CatalogId { get; set; }
        public string ContainerType { get; set; }
        public double Height { get; set; }
        public double Width { get; set; }
        public double Length { get; set; }
        public double LowerDiameter { get; set; }
        public double UpperDiameter { get; set; }

        public ContainerModel(int id, int catalogId, string containerType, string name, double height, double width, double length, double lowerDiameter, double upperDiameter)
        {
            Id = id;
            CatalogId = catalogId;
            ContainerType = containerType;
            Name = name;
            Height = height;
            Width = width;
            Length = length;
            LowerDiameter = lowerDiameter;
            UpperDiameter = upperDiameter;
        }
    }
}
