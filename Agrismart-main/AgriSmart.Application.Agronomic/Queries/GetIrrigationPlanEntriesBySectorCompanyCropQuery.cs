using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Agronomic.Queries
{
    public class GetIrrigationPlanEntriesBySectorCompanyCropQuery : IRequest<Response<GetIrrigationPlanEntriesBySectorCompanyCropResponse>>
    {
        public int? SectorId { get; set; }
        public int? CompanyId { get; set; }
        public int? CropId { get; set; }
    }

    public class GetIrrigationPlanEntriesBySectorCompanyCropHandler
        : IRequestHandler<GetIrrigationPlanEntriesBySectorCompanyCropQuery, Response<GetIrrigationPlanEntriesBySectorCompanyCropResponse>>
    {
        private readonly IIrrigationPlanEntryQueryRepository _queryRepository;

        public GetIrrigationPlanEntriesBySectorCompanyCropHandler(IIrrigationPlanEntryQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<GetIrrigationPlanEntriesBySectorCompanyCropResponse>> Handle(
            GetIrrigationPlanEntriesBySectorCompanyCropQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var entries = await _queryRepository.GetBySectorCompanyCropAsync(
                    request.SectorId, request.CompanyId, request.CropId);

                return new Response<GetIrrigationPlanEntriesBySectorCompanyCropResponse>(
                    new GetIrrigationPlanEntriesBySectorCompanyCropResponse
                    {
                        IrrigationPlanEntries = entries.Select(x => new IrrigationPlanEntryScheduleDto
                        {
                            Id = x.Id,
                            IrrigationPlanId = x.IrrigationPlanId,
                            IrrigationModeId = x.IrrigationModeId,
                            StartTime = x.StartTime,
                            ExecutionDate = x.ExecutionDate,
                            Duration = x.Duration,
                            WStart = x.WStart,
                            WEnd = x.WEnd,
                            Frequency = x.Frequency,
                            Sequence = x.Sequence
                        }).ToList()
                    });
            }
            catch (Exception ex)
            {
                return new Response<GetIrrigationPlanEntriesBySectorCompanyCropResponse>(ex);
            }
        }
    }
}