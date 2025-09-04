using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface ICompanyService
    {
        Task<GetAllCompaniesResponse> GetAll(GetAllCompaniesRequest request);
        Task<CompanyResponse> GetById(GetCompanyByIdRequest request);
        Task<CompanyResponse> Create(CreateCompanyRequest request);
        Task<CompanyResponse> Update(UpdateCompanyRequest request);
    }
}
