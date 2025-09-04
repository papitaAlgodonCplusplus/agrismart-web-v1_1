using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateCalculationSettingHandler : IRequestHandler<UpdateCalculationSettingCommand, Response<UpdateCalculationSettingResponse>>
    {
        private readonly ICalculationSettingCommandRepository _CalculationSettingCommandRepository;
        private readonly ICalculationSettingQueryRepository _CalculationSettingQueryRepository;

        public UpdateCalculationSettingHandler(ICalculationSettingCommandRepository CalculationSettingCommandRepository, ICalculationSettingQueryRepository CalculationSettingQueryRepository)
        {
            _CalculationSettingCommandRepository = CalculationSettingCommandRepository;
            _CalculationSettingQueryRepository = CalculationSettingQueryRepository;
        }

        public async Task<Response<UpdateCalculationSettingResponse>> Handle(UpdateCalculationSettingCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateCalculationSettingValidator validator = new UpdateCalculationSettingValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateCalculationSettingResponse>(new Exception(errors.ToString()));
                }

                CalculationSetting getResult = await _CalculationSettingQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.CatalogId = command.CatalogId;
                    getResult.Name = command.Name;
                    getResult.Value = command.Value;;
                    getResult.Active = command.Active;
                    getResult.UpdatedBy = _CalculationSettingCommandRepository.GetSessionUserId();
                }

                CalculationSetting updateCalculationSettingResult = await _CalculationSettingCommandRepository.UpdateAsync(getResult);

                if (updateCalculationSettingResult != null)
                {
                    UpdateCalculationSettingResponse updateCalculationSettingResponse = AgronomicMapper.Mapper.Map<UpdateCalculationSettingResponse>(updateCalculationSettingResult);

                    return new Response<UpdateCalculationSettingResponse>(updateCalculationSettingResponse);
                }
                return new Response<UpdateCalculationSettingResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateCalculationSettingResponse>(ex);
            }
        }
    }
}