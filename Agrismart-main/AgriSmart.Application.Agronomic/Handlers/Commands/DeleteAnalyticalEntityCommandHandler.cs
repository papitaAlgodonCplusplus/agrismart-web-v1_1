using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteAnalyticalEntityCommandHandler : IRequestHandler<DeleteAnalyticalEntityCommand, Response<DeleteAnalyticalEntityResponse>>
    {
        private readonly IAnalyticalEntityCommandRepository _analyticalEntityCommandRepository;

        public DeleteAnalyticalEntityCommandHandler(IAnalyticalEntityCommandRepository analyticalEntityCommandRepository)
        {
            _analyticalEntityCommandRepository = analyticalEntityCommandRepository;
        }

        public async Task<Response<DeleteAnalyticalEntityResponse>> Handle(DeleteAnalyticalEntityCommand command, CancellationToken cancellationToken)
        {
            try
            {
                AnalyticalEntity deleteAnalyticalEntity = AgronomicMapper.Mapper.Map<AnalyticalEntity>(command);

                await _analyticalEntityCommandRepository.DeleteAsync(deleteAnalyticalEntity);

                return new Response<DeleteAnalyticalEntityResponse>(new DeleteAnalyticalEntityResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteAnalyticalEntityResponse>(ex);
            }
        }
    }
}