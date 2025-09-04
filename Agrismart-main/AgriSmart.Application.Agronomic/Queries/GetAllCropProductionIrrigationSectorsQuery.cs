using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllCropProductionIrrigationSectorsQuery : IRequest<Response<GetAllCropProductionIrrigationSectorsResponse>>
    {
        public int CompanyId { get; set; }
        public int FarmId { get; set; }
        public int ProductionUnitId { get; set; }
        public int CropProductionId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}