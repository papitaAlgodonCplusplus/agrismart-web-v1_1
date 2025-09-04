using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateAnaliticalEntityHandler : IRequestHandler<UpdateAnaliticalEntityCommand, Response<UpdateAnalyticalEntityResponse>>
    {
        private readonly IAnalyticalEntityCommandRepository _analiticalEntityCommandRepository;
        private readonly IAnalyticalEntityQueryRepository _analiticalEntityQueryRepository;

        public UpdateAnaliticalEntityHandler(IAnalyticalEntityCommandRepository analiticalEntityCommandRepository, IAnalyticalEntityQueryRepository analiticalEntityQueryRepository)
        {
            _analiticalEntityCommandRepository = analiticalEntityCommandRepository;
            _analiticalEntityQueryRepository = analiticalEntityQueryRepository;            
        }

        public async Task<Response<UpdateAnalyticalEntityResponse>> Handle(UpdateAnaliticalEntityCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateAnaliticalEntityValidator validator = new UpdateAnaliticalEntityValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateAnalyticalEntityResponse>(new Exception(errors.ToString()));
                }

                AnalyticalEntity getResult = await _analiticalEntityQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.CatalogId = getResult.CatalogId;
                    getResult.Name = command.Name;
                    getResult.Description = command.Description;
                    getResult.Script = command.Script;
                    getResult.Active = command.Active;
                }

                AnalyticalEntity updateAnaliticalEntityResult = await _analiticalEntityCommandRepository.UpdateAsync(getResult);

                if (updateAnaliticalEntityResult != null)
                {
                    UpdateAnalyticalEntityResponse updateAnaliticalEntityResponse  = new UpdateAnalyticalEntityResponse()
                    {
                        Id = updateAnaliticalEntityResult.Id,
                        Name = updateAnaliticalEntityResult.Name,
                        Description = updateAnaliticalEntityResult.Description,
                        Script = updateAnaliticalEntityResult.Script,
                        EntityType = updateAnaliticalEntityResult.EntityType,
                        Active = updateAnaliticalEntityResult.Active
                    };

                    return new Response<UpdateAnalyticalEntityResponse>(updateAnaliticalEntityResponse);
                }
                return new Response<UpdateAnalyticalEntityResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateAnalyticalEntityResponse>(ex);
            }
        }
    }
}
