using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateLicenseCommand : IRequest<Response<CreateLicenseResponse>>
    {
        public int ClientId { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public int AllowedCompanies { get; set; }
        public int AllowedFarms { get; set; }
        public int AllowedUsers { get; set; }
        public int AllowedProductionUnits { get; set; }
        public int AllowedCropProductions { get; set; }
    }
}
