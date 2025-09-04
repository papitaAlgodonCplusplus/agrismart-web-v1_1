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
    public class CreateAnalyticalEntityHandler : IRequestHandler<CreateAnaliticalEntityCommand, Response<CreateAnalyticalEntityResponse>>
    {
        private readonly IAnalyticalEntityCommandRepository _analiticalEntityCommandRepository;

        public CreateAnalyticalEntityHandler(IAnalyticalEntityCommandRepository analiticalEntityCommandRepository)
        {
            _analiticalEntityCommandRepository = analiticalEntityCommandRepository;            
        }

        public async Task<Response<CreateAnalyticalEntityResponse>> Handle(CreateAnaliticalEntityCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateAnaliticalEntityValidator validator = new CreateAnaliticalEntityValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateAnalyticalEntityResponse>(new Exception(errors.ToString()));
                }

                AnalyticalEntity newAnaliticalEntity = AgronomicMapper.Mapper.Map<AnalyticalEntity>(command);

                newAnaliticalEntity.CreatedBy = _analiticalEntityCommandRepository.GetSessionUserId();
                newAnaliticalEntity.Active = true;

                var createAnaliticalEntityResult = await _analiticalEntityCommandRepository.CreateAsync(newAnaliticalEntity);

                if (createAnaliticalEntityResult != null)
                {
                    CreateAnalyticalEntityResponse createAnaliticalEntityResponse = AgronomicMapper.Mapper.Map<CreateAnalyticalEntityResponse>(createAnaliticalEntityResult);

                    return new Response<CreateAnalyticalEntityResponse>(createAnaliticalEntityResponse);
                }
                return new Response<CreateAnalyticalEntityResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateAnalyticalEntityResponse>(ex);
            }
        }
    }
}
