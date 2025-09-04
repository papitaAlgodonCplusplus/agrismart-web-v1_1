using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CreateRelayModuleCropProductionIrrigationSectorHandler : IRequestHandler<CreateRelayModuleCropProductionIrrigationSectorCommand, Response<CreateRelayModuleCropProductionIrrigationSectorResponse>>
    {
        private readonly IRelayModuleCropProductionIrrigationSectorCommandRepository _RelayModuleCropProductionIrrigationSectorCommandRepository;

        public CreateRelayModuleCropProductionIrrigationSectorHandler(IRelayModuleCropProductionIrrigationSectorCommandRepository RelayModuleCropProductionIrrigationSectorCommandRepository)
        {
            _RelayModuleCropProductionIrrigationSectorCommandRepository = RelayModuleCropProductionIrrigationSectorCommandRepository;
        }

        public async Task<Response<CreateRelayModuleCropProductionIrrigationSectorResponse>> Handle(CreateRelayModuleCropProductionIrrigationSectorCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateRelayModuleCropProductionIrrigationSectorValidator validator = new CreateRelayModuleCropProductionIrrigationSectorValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateRelayModuleCropProductionIrrigationSectorResponse>(new Exception(errors.ToString()));
                }

                int sessionUserId = _RelayModuleCropProductionIrrigationSectorCommandRepository.GetSessionUserId();
                int sessionProfileId = _RelayModuleCropProductionIrrigationSectorCommandRepository.GetSessionProfileId();
                RelayModuleCropProductionIrrigationSector newRelayModuleCropProductionIrrigationSector = AgronomicMapper.Mapper.Map<RelayModuleCropProductionIrrigationSector>(command);

                newRelayModuleCropProductionIrrigationSector.CreatedBy = sessionUserId;
                newRelayModuleCropProductionIrrigationSector.Active = true;

                var createRelayModuleCropProductionIrrigationSectorResult = await _RelayModuleCropProductionIrrigationSectorCommandRepository.CreateAsync(newRelayModuleCropProductionIrrigationSector);

                if (createRelayModuleCropProductionIrrigationSectorResult != null)
                {
                    CreateRelayModuleCropProductionIrrigationSectorResponse createRelayModuleCropProductionIrrigationSectorResponse = AgronomicMapper.Mapper.Map<CreateRelayModuleCropProductionIrrigationSectorResponse>(createRelayModuleCropProductionIrrigationSectorResult);

                    return new Response<CreateRelayModuleCropProductionIrrigationSectorResponse>(createRelayModuleCropProductionIrrigationSectorResponse);
                }
                return new Response<CreateRelayModuleCropProductionIrrigationSectorResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateRelayModuleCropProductionIrrigationSectorResponse>(ex);
            }
        }
    }
}