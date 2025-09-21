using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteCalculationSettingCommandHandler : IRequestHandler<DeleteCalculationSettingCommand, Response<DeleteCalculationSettingResponse>>
    {
        private readonly ICalculationSettingCommandRepository _calculationSettingCommandRepository;

        public DeleteCalculationSettingCommandHandler(ICalculationSettingCommandRepository calculationSettingCommandRepository)
        {
            _calculationSettingCommandRepository = calculationSettingCommandRepository;
        }

        public async Task<Response<DeleteCalculationSettingResponse>> Handle(DeleteCalculationSettingCommand command, CancellationToken cancellationToken)
        {
            try
            {
                CalculationSetting deleteCalculationSetting = AgronomicMapper.Mapper.Map<CalculationSetting>(command);

                await _calculationSettingCommandRepository.DeleteAsync(deleteCalculationSetting);

                return new Response<DeleteCalculationSettingResponse>(new DeleteCalculationSettingResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteCalculationSettingResponse>(ex);
            }
        }
    }
}