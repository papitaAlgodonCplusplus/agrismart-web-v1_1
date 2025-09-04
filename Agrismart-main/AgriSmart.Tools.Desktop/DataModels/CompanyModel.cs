namespace AgriSmart.Tools.DataModels
{
    public class CompanyModel: BaseModel
    {
        public int ClientId { get; set; }
        public string DeviceUser { get; set; }
        public string Description { get; set; }
        public bool Active { get; set; }
        public int CatalogId { get; set; }
    }
}
