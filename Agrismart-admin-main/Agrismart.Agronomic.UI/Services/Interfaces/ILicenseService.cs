using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface ILicenseService
    {
        Task<GetAllLicensesResponse> GetAll(GetAllLicensesRequest request);
        Task<LicenseResponse> Create(CreateLicenseRequest request);
        Task<LicenseResponse> Update(UpdateLicenseRequest request);
    }
}