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
    public class CreateCropProductionHandler : IRequestHandler<CreateCropProductionCommand, Response<CreateCropProductionResponse>>
    {
        private readonly ICropProductionCommandRepository _cropProductionCommandRepository;

        public CreateCropProductionHandler(ICropProductionCommandRepository cropProductionCommandRepository)
        {
            _cropProductionCommandRepository = cropProductionCommandRepository;            
        }

        public async Task<Response<CreateCropProductionResponse>> Handle(CreateCropProductionCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateCropProductionValidator validator = new CreateCropProductionValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateCropProductionResponse>(new Exception(errors.ToString()));
                }

                CropProduction newCropProduction = AgronomicMapper.Mapper.Map<CropProduction>(command);

                newCropProduction.CreatedBy = _cropProductionCommandRepository.GetSessionUserId();
                newCropProduction.Active = true;

                var createCropProductionResult = await _cropProductionCommandRepository.CreateAsync(newCropProduction);

                if (createCropProductionResult != null)
                {
                    CreateCropProductionResponse createCropProductionResponse = AgronomicMapper.Mapper.Map<CreateCropProductionResponse>(createCropProductionResult);

                    return new Response<CreateCropProductionResponse>(createCropProductionResponse);
                }
                return new Response<CreateCropProductionResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateCropProductionResponse>(ex);
            }
        }
    }
}
