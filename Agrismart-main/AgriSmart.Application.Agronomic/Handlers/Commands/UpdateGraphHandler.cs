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
    public class UpdateGraphHandler : IRequestHandler<UpdateGraphCommand, Response<UpdateGraphResponse>>
    {
        private readonly IGraphCommandRepository _graphCommandRepository;
        private readonly IGraphQueryRepository _graphQueryRepository;

        public UpdateGraphHandler(IGraphCommandRepository graphCommandRepository, IGraphQueryRepository graphQueryRepository)
        {
            _graphCommandRepository = graphCommandRepository;
            _graphQueryRepository = graphQueryRepository;            
        }

        public async Task<Response<UpdateGraphResponse>> Handle(UpdateGraphCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateGraphValidator validator = new UpdateGraphValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateGraphResponse>(new Exception(errors.ToString()));
                }

                Graph getResult = await _graphQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.Name = command.Name;
                    getResult.Description = command.Description;
                    getResult.SummaryTimeScale = command.SummaryTimeScale;
                    getResult.YAxisScaleType = command.YAxisScaleType;
                    getResult.Series = command.Series;
                    getResult.Active = command.Active;
                }

                Graph updateGraphResult = await _graphCommandRepository.UpdateAsync(getResult);

                if (updateGraphResult != null)
                {
                    UpdateGraphResponse updateGraphResponse  = new UpdateGraphResponse()
                    {
                        Id = updateGraphResult.Id,
                        Name = updateGraphResult.Name,
                        Description = updateGraphResult.Description,
                        SummaryTimeScale = updateGraphResult.SummaryTimeScale,
                        Active = updateGraphResult.Active
                    };

                    return new Response<UpdateGraphResponse>(updateGraphResponse);
                }
                return new Response<UpdateGraphResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateGraphResponse>(ex);
            }
        }
    }
}
