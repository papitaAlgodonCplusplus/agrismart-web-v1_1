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
    public class CreateGraphHandler : IRequestHandler<CreateGraphCommand, Response<CreateGraphResponse>>
    {
        private readonly IGraphCommandRepository _graphCommandRepository;

        public CreateGraphHandler(IGraphCommandRepository graphCommandRepository)
        {
            _graphCommandRepository = graphCommandRepository;            
        }

        public async Task<Response<CreateGraphResponse>> Handle(CreateGraphCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateGraphValidator validator = new CreateGraphValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateGraphResponse>(new Exception(errors.ToString()));
                }

                Graph newGraph = AgronomicMapper.Mapper.Map<Graph>(command);

                newGraph.CreatedBy = _graphCommandRepository.GetSessionUserId();
                newGraph.Active = true;

                var createGraphResult = await _graphCommandRepository.CreateAsync(newGraph);

                if (createGraphResult != null)
                {
                    CreateGraphResponse createGraphResponse = AgronomicMapper.Mapper.Map<CreateGraphResponse>(createGraphResult);

                    return new Response<CreateGraphResponse>(createGraphResponse);
                }
                return new Response<CreateGraphResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateGraphResponse>(ex);
            }
        }
    }
}
