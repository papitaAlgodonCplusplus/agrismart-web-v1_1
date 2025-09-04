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
    public class CreateGrowingMediumHandler : IRequestHandler<CreateGrowingMediumCommand, Response<CreateGrowingMediumResponse>>
    {
        private readonly IGrowingMediumCommandRepository _growingMediumCommandRepository;

        public CreateGrowingMediumHandler(IGrowingMediumCommandRepository growingMediumCommandRepository)
        {
            _growingMediumCommandRepository = growingMediumCommandRepository;
        }

        public async Task<Response<CreateGrowingMediumResponse>> Handle(CreateGrowingMediumCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateGrowingMediumValidator validator = new CreateGrowingMediumValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateGrowingMediumResponse>(new Exception(errors.ToString()));
                }

                GrowingMedium newGrowingMedium = AgronomicMapper.Mapper.Map<GrowingMedium>(command);

                newGrowingMedium.CreatedBy = _growingMediumCommandRepository.GetSessionUserId();
                newGrowingMedium.Active = true;

                var createGrowingMediumResult = await _growingMediumCommandRepository.CreateAsync(newGrowingMedium);

                if (createGrowingMediumResult != null)
                {
                    CreateGrowingMediumResponse createGrowingMediumResponse = AgronomicMapper.Mapper.Map<CreateGrowingMediumResponse>(createGrowingMediumResult);

                    return new Response<CreateGrowingMediumResponse>(createGrowingMediumResponse);
                }
                return new Response<CreateGrowingMediumResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateGrowingMediumResponse>(ex);
            }
        }
    }
}
