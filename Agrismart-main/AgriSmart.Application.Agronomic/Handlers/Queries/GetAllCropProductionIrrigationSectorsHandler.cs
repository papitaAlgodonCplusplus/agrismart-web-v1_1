using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllCropProductionIrrigationSectorsHandler : IRequestHandler<GetAllCropProductionIrrigationSectorsQuery, Response<GetAllCropProductionIrrigationSectorsResponse>>
    {
        private readonly ICropProductionIrrigationSectorQueryRepository _cropProductionIrrigationSectorQueryRepository;

        public GetAllCropProductionIrrigationSectorsHandler(ICropProductionIrrigationSectorQueryRepository cropProductionIrrigationSectorQueryRepository)
        {
            _cropProductionIrrigationSectorQueryRepository = cropProductionIrrigationSectorQueryRepository;
        }

        public async Task<Response<GetAllCropProductionIrrigationSectorsResponse>> Handle(GetAllCropProductionIrrigationSectorsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllCropProductionIrrigationSectorsValidator validator = new GetAllCropProductionIrrigationSectorsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllCropProductionIrrigationSectorsResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _cropProductionIrrigationSectorQueryRepository.GetAllAsync(query.CompanyId, query.FarmId, query.ProductionUnitId, query.CropProductionId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllCropProductionIrrigationSectorsResponse getAllCropProductionIrrigationSectorsResponse = new GetAllCropProductionIrrigationSectorsResponse();
                    getAllCropProductionIrrigationSectorsResponse.CropProductionIrrigationSectors = getAllResult;
                    return new Response<GetAllCropProductionIrrigationSectorsResponse>(getAllCropProductionIrrigationSectorsResponse);
                }
                return new Response<GetAllCropProductionIrrigationSectorsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllCropProductionIrrigationSectorsResponse>(ex);
            }
        }
    }
}
