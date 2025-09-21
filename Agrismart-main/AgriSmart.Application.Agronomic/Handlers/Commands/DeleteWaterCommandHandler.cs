using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteWaterCommandHandler : IRequestHandler<DeleteWaterCommand, Response<DeleteWaterResponse>>
    {
        private readonly IWaterCommandRepository _waterCommandRepository;

        public DeleteWaterCommandHandler(IWaterCommandRepository waterCommandRepository)
        {
            _waterCommandRepository = waterCommandRepository;
        }

        public async Task<Response<DeleteWaterResponse>> Handle(DeleteWaterCommand command, CancellationToken cancellationToken)
        {
            try
            {
                Water deleteWater = AgronomicMapper.Mapper.Map<Water>(command);

                await _waterCommandRepository.DeleteAsync(deleteWater);

                return new Response<DeleteWaterResponse>(new DeleteWaterResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteWaterResponse>(ex);
            }
        }
    }
}