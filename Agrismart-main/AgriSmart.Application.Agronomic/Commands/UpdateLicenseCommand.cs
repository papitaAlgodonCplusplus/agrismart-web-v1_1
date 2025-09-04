using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateLicenseCommand : IRequest<Response<UpdateLicenseResponse>>
    {
        public int Id { get; set; }
        public DateTime ExpirationDate { get; set; }
        public int AllowedCompanies { get; set; }
        public int AllowedFarms { get; set; }
        public int AllowedUsers { get; set; }
        public int AllowedProductionUnits { get; set; }
        public int AllowedCropProductions { get; set; }
        public bool Active { get; set; }
    }
}
