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
    public class CreateCropProductionIrrigationSectorHandler : IRequestHandler<CreateCropProductionIrrigationSectorCommand, Response<CreateCropProductionIrrigationSectorResponse>>
    {
        private readonly ICropProductionIrrigationSectorCommandRepository _cropProductionIrrigationSectorCommandRepository;

        public CreateCropProductionIrrigationSectorHandler(ICropProductionIrrigationSectorCommandRepository cropProductionIrrigationSectorCommandRepository)
        {
            _cropProductionIrrigationSectorCommandRepository = cropProductionIrrigationSectorCommandRepository;            
        }

        public async Task<Response<CreateCropProductionIrrigationSectorResponse>> Handle(CreateCropProductionIrrigationSectorCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateCropProductionIrrigationSectorValidator validator = new CreateCropProductionIrrigationSectorValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateCropProductionIrrigationSectorResponse>(new Exception(errors.ToString()));
                }

                CropProductionIrrigationSector newCropProductionIrrigationSector = AgronomicMapper.Mapper.Map<CropProductionIrrigationSector>(command);

                newCropProductionIrrigationSector.CreatedBy = _cropProductionIrrigationSectorCommandRepository.GetSessionUserId();
                newCropProductionIrrigationSector.Active = true;

                var createCropProductionIrrigationSectorResult = await _cropProductionIrrigationSectorCommandRepository.CreateAsync(newCropProductionIrrigationSector);

                if (createCropProductionIrrigationSectorResult != null)
                {
                    CreateCropProductionIrrigationSectorResponse createCropProductionIrrigationSectorResponse = AgronomicMapper.Mapper.Map<CreateCropProductionIrrigationSectorResponse>(createCropProductionIrrigationSectorResult);

                    return new Response<CreateCropProductionIrrigationSectorResponse>(createCropProductionIrrigationSectorResponse);
                }
                return new Response<CreateCropProductionIrrigationSectorResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateCropProductionIrrigationSectorResponse>(ex);
            }
        }
    }
}
