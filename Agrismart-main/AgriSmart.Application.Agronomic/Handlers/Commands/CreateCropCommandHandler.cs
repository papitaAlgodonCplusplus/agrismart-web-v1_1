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
    public class CreateCropCommandHandler : IRequestHandler<CreateCropCommand, Response<CreateCropResponse>>
    {
        private readonly ICropCommandRepository _cropCommandRepository;

        public CreateCropCommandHandler(ICropCommandRepository cropCommandRepository)
        {
            _cropCommandRepository = cropCommandRepository;
        }

        public async Task<Response<CreateCropResponse>> Handle(CreateCropCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateCropValidator validator = new CreateCropValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateCropResponse>(new Exception(errors.ToString()));
                }

                int sessionUserId = _cropCommandRepository.GetSessionUserId();
                Crop newCrop = AgronomicMapper.Mapper.Map<Crop>(command);

                newCrop.CreatedBy = sessionUserId;
                newCrop.Active = command.Active;

                var createCropResult = await _cropCommandRepository.CreateAsync(newCrop);

                if (createCropResult != null)
                {
                    CreateCropResponse createCropResponse = AgronomicMapper.Mapper.Map<CreateCropResponse>(createCropResult);
                    return new Response<CreateCropResponse>(createCropResponse);
                }
                return new Response<CreateCropResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateCropResponse>(ex);
            }
        }
    }
}