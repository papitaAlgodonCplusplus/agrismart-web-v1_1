namespace AgriSmart.Tools.DataModels
{
    public class FarmModel: BaseModel
    {
        public int CompanyId { get; set; }
        public string Description { get; set; }
        public string Polygon { get; set; }

        public FarmModel(int id, int companyId, string name, string description, string polygon, bool active)
        {
            Id = id;
            Name = name;
            CompanyId = companyId;
            Description = description;
            Polygon = polygon;
            Active = active;
        }
    }
}
