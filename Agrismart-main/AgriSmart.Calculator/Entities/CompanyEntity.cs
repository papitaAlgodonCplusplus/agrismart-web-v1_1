using AgriSmart.Calculator.Entities.Base;
using AgriSmart.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Entities
{
    public class CompanyEntity:BaseCalculationEntity
    {
        public int ClientId { get; set; }
        public string DeviceUser { get; set; }
        public string Description { get; set; }
        public bool Active { get; set; }
        public int CatalogsId { get; set; }

        public CompanyEntity(Company model)
        {
            Id = model.Id;
            ClientId = model.ClientId;
            DeviceUser = model.DeviceUser;
            Description = model.Description;
            Active = model.Active;
            //CatalogsId = model.CatalogsId;
        }
    }
}
