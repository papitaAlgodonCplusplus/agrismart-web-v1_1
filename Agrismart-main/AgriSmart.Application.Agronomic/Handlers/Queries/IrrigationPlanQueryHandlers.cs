using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    // Get All Handler
    public class GetAllIrrigationPlansHandler : IRequestHandler<GetAllIrrigationPlansQuery, Response<GetAllIrrigationPlansResponse>>
    {
        private readonly IIrrigationPlanQueryRepository _queryRepository;

        public GetAllIrrigationPlansHandler(IIrrigationPlanQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<GetAllIrrigationPlansResponse>> Handle(GetAllIrrigationPlansQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var irrigationPlans = await _queryRepository.GetAllAsync();

                var response = new GetAllIrrigationPlansResponse
                {
                    IrrigationPlans = irrigationPlans.Select(x => new IrrigationPlanDto
                    {
                        Id = x.Id,
                        Name = x.Name,
                        DayMask = x.DayMask,
                        Active = x.Active,
                        DateCreated = x.DateCreated,
                        DateUpdated = x.DateUpdated,
                        CreatedBy = x.CreatedBy,
                        UpdatedBy = x.UpdatedBy
                    }).ToList()
                };

                return new Response<GetAllIrrigationPlansResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<GetAllIrrigationPlansResponse>(ex);
            }
        }
    }

    // Get By Id Handler
    public class GetIrrigationPlanByIdHandler : IRequestHandler<GetIrrigationPlanByIdQuery, Response<GetIrrigationPlanByIdResponse>>
    {
        private readonly IIrrigationPlanQueryRepository _queryRepository;

        public GetIrrigationPlanByIdHandler(IIrrigationPlanQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<GetIrrigationPlanByIdResponse>> Handle(GetIrrigationPlanByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var irrigationPlan = await _queryRepository.GetByIdAsync(query.Id);

                if (irrigationPlan == null)
                    return new Response<GetIrrigationPlanByIdResponse>(new Exception("IrrigationPlan not found"));

                var response = new GetIrrigationPlanByIdResponse
                {
                    IrrigationPlan = new IrrigationPlanDto
                    {
                        Id = irrigationPlan.Id,
                        Name = irrigationPlan.Name,
                        DayMask = irrigationPlan.DayMask,
                        Active = irrigationPlan.Active,
                        DateCreated = irrigationPlan.DateCreated,
                        DateUpdated = irrigationPlan.DateUpdated,
                        CreatedBy = irrigationPlan.CreatedBy,
                        UpdatedBy = irrigationPlan.UpdatedBy
                    }
                };

                return new Response<GetIrrigationPlanByIdResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<GetIrrigationPlanByIdResponse>(ex);
            }
        }
    }
}