using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllRelayModuleCropProductionIrrigationSectorsHandler : IRequestHandler<GetAllRelayModuleCropProductionIrrigationSectorsQuery, Response<GetAllRelayModuleCropProductionIrrigationSectorsResponse>>
    {
        private readonly IRelayModuleCropProductionIrrigationSectorQueryRepository _RelayModuleCropProductionIrrigationSectorQueryRepository;

        public GetAllRelayModuleCropProductionIrrigationSectorsHandler(IRelayModuleCropProductionIrrigationSectorQueryRepository RelayModuleCropProductionIrrigationSectorQueryRepository)
        {
            _RelayModuleCropProductionIrrigationSectorQueryRepository = RelayModuleCropProductionIrrigationSectorQueryRepository;
        }

        public async Task<Response<GetAllRelayModuleCropProductionIrrigationSectorsResponse>> Handle(GetAllRelayModuleCropProductionIrrigationSectorsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllRelayModuleCropProductionIrrigationSectorsValidator validator = new GetAllRelayModuleCropProductionIrrigationSectorsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllRelayModuleCropProductionIrrigationSectorsResponse>(new Exception(errors.ToString()));
                }

                //var getResult = await _RelayModuleCropProductionIrrigationSectorQueryRepository.GetAllAsync(query.RelayModuleId);

                //if (getResult != null)
                //{
                //    GetAllRelayModuleCropProductionIrrigationSectorsResponse getAllRelayModuleCropProductionIrrigationSectorsResponse = new GetAllRelayModuleCropProductionIrrigationSectorsResponse();
                //    getAllRelayModuleCropProductionIrrigationSectorsResponse.RelayModuleCropProductionIrrigationSectors = getResult;
                //    return new Response<GetAllRelayModuleCropProductionIrrigationSectorsResponse>(getAllRelayModuleCropProductionIrrigationSectorsResponse);
                //}
                return new Response<GetAllRelayModuleCropProductionIrrigationSectorsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllRelayModuleCropProductionIrrigationSectorsResponse>(ex);
            }
        }
    }
}