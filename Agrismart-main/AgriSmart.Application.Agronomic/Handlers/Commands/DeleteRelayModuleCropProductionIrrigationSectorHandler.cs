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
    public class DeleteRelayModuleCropProductionIrrigationSectorHandler : IRequestHandler<DeleteRelayModuleCropProductionIrrigationSectorCommand, Response<DeleteRelayModuleCropProductionIrrigationSectorResponse>>
    {
        private readonly IRelayModuleCropProductionIrrigationSectorCommandRepository _RelayModuleCropProductionIrrigationSectorCommandRepository;

        public DeleteRelayModuleCropProductionIrrigationSectorHandler(IRelayModuleCropProductionIrrigationSectorCommandRepository RelayModuleCropProductionIrrigationSectorCommandRepository)
        {
            _RelayModuleCropProductionIrrigationSectorCommandRepository = RelayModuleCropProductionIrrigationSectorCommandRepository;
        }

        public async Task<Response<DeleteRelayModuleCropProductionIrrigationSectorResponse>> Handle(DeleteRelayModuleCropProductionIrrigationSectorCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (DeleteRelayModuleCropProductionIrrigationSectorValidator validator = new DeleteRelayModuleCropProductionIrrigationSectorValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<DeleteRelayModuleCropProductionIrrigationSectorResponse>(new Exception(errors.ToString()));
                }

                RelayModuleCropProductionIrrigationSector deleteRelayModuleCropProductionIrrigationSector = AgronomicMapper.Mapper.Map<RelayModuleCropProductionIrrigationSector>(command);

                await _RelayModuleCropProductionIrrigationSectorCommandRepository.DeleteAsync(deleteRelayModuleCropProductionIrrigationSector);

                return new Response<DeleteRelayModuleCropProductionIrrigationSectorResponse>(new DeleteRelayModuleCropProductionIrrigationSectorResponse());
            }
            catch (Exception ex)
            {
                return new Response<DeleteRelayModuleCropProductionIrrigationSectorResponse>(ex);
            }
        }
    }
}