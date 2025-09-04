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
    public class CreateCalculationSettingHandler : IRequestHandler<CreateCalculationSettingCommand, Response<CreateCalculationSettingResponse>>
    {
        private readonly ICalculationSettingCommandRepository _calculationSettingCommandRepository;

        public CreateCalculationSettingHandler(ICalculationSettingCommandRepository calculationSettingCommandRepository)
        {
            _calculationSettingCommandRepository = calculationSettingCommandRepository;            
        }

        public async Task<Response<CreateCalculationSettingResponse>> Handle(CreateCalculationSettingCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateCalculationSettingValidator validator = new CreateCalculationSettingValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateCalculationSettingResponse>(new Exception(errors.ToString()));
                }

                CalculationSetting newCalculationSetting = AgronomicMapper.Mapper.Map<CalculationSetting>(command);

                newCalculationSetting.CreatedBy = _calculationSettingCommandRepository.GetSessionUserId();
                newCalculationSetting.Active = true;

                var createCalculationSettingResult = await _calculationSettingCommandRepository.CreateAsync(newCalculationSetting);

                if (createCalculationSettingResult != null)
                {
                    CreateCalculationSettingResponse createCalculationSettingResponse = AgronomicMapper.Mapper.Map<CreateCalculationSettingResponse>(createCalculationSettingResult);

                    return new Response<CreateCalculationSettingResponse>(createCalculationSettingResponse);
                }
                return new Response<CreateCalculationSettingResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateCalculationSettingResponse>(ex);
            }
        }
    }
}