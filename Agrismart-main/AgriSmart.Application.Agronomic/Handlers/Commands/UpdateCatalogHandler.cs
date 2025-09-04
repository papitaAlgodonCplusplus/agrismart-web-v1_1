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
    public class UpdateCatalogHandler : IRequestHandler<UpdateCatalogCommand, Response<UpdateCatalogResponse>>
    {
        private readonly ICatalogCommandRepository _catalogCommandRepository;
        private readonly ICatalogQueryRepository _catalogQueryRepository;

        public UpdateCatalogHandler(ICatalogCommandRepository catalogCommandRepository, ICatalogQueryRepository catalogQueryRepository)
        {
            _catalogCommandRepository = catalogCommandRepository;
            _catalogQueryRepository = catalogQueryRepository;        
        }

        public async Task<Response<UpdateCatalogResponse>> Handle(UpdateCatalogCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateCatalogValidator validator = new UpdateCatalogValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateCatalogResponse>(new Exception(errors.ToString()));
                }

                Catalog getResult = await _catalogQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.ClientId = command.ClientId;
                    getResult.Name = command.Name;
                    getResult.Active = command.Active;
                }

                Catalog updateCatalogResult = await _catalogCommandRepository.UpdateAsync(getResult);

                if (updateCatalogResult != null)
                {
                    UpdateCatalogResponse updateCatalogResponse  = new UpdateCatalogResponse()
                    {
                        Id = updateCatalogResult.Id,
                        ClientId = updateCatalogResult.ClientId,
                        Name = updateCatalogResult.Name,
                        Active = updateCatalogResult.Active
                    };

                    return new Response<UpdateCatalogResponse>(updateCatalogResponse);
                }
                return new Response<UpdateCatalogResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateCatalogResponse>(ex);
            }
        }
    }
}
