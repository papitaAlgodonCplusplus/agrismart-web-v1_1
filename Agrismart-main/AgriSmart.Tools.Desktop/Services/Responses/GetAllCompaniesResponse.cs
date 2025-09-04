using AgriSmart.AgronomicProcess.Models;
using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllCompaniesResponse
    {
        public List<CompanyModel>? Companies { get; set; }
    }
}
