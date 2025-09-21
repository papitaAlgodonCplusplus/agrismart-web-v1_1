using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteCatalogCommandHandler : IRequestHandler<DeleteCatalogCommand, Response<DeleteCatalogResponse>>
    {
        private readonly ICatalogCommandRepository _catalogCommandRepository;

        public DeleteCatalogCommandHandler(ICatalogCommandRepository catalogCommandRepository)
        {
            _catalogCommandRepository = catalogCommandRepository;
        }

        public async Task<Response<DeleteCatalogResponse>> Handle(DeleteCatalogCommand command, CancellationToken cancellationToken)
        {
            try
            {
                Catalog deleteCatalog = AgronomicMapper.Mapper.Map<Catalog>(command);

                await _catalogCommandRepository.DeleteAsync(deleteCatalog);

                return new Response<DeleteCatalogResponse>(new DeleteCatalogResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteCatalogResponse>(ex);
            }
        }
    }
}