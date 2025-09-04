using AgriSmart.Core.Entities;
using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Entities
{
    public class CompanyEntity:BaseEntity
    {
        public int ClientId { get; set; }
        public string DeviceUser { get; set; }
        public string Description { get; set; }
        public bool Active { get; set; }
        public int CatalogId { get; set; }
        public List<FarmEntity>  Farms { get; set; } 


        public CompanyEntity(CompanyModel model)
        {
            this.CopyPropertiesFrom(model);
        }
    }
}
