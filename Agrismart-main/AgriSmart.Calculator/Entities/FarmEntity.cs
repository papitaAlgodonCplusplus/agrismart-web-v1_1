using AgriSmart.Calculator.Entities.Base;
using AgriSmart.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Entities
{
    public class FarmEntity:BaseCalculationEntity
    {
        public CompanyEntity Company { get; set; }
        public string Description { get; set; }
        public string Polygon { get; set; }
        public bool Active { get; set; }

        public FarmEntity(Farm farmModel)
        {
            Id = farmModel.Id;
            Name = farmModel.Name;
            Description = farmModel.Description;
            //Polygon = farmModel.Polygon;
            Active = farmModel.Active;
        }
        public FarmEntity(Farm farmModel, Company company)
        {
            Id = farmModel.Id;
            Name = farmModel.Name;
            Company = new CompanyEntity(company);
            Description = farmModel.Description;
            //Polygon = farmModel.Polygon;
            Active = farmModel.Active;
        }
    }
}
