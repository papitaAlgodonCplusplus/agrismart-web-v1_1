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
    public class CreateCatalogHandler : IRequestHandler<CreateCatalogCommand, Response<CreateCatalogResponse>>
    {
        private readonly ICatalogCommandRepository _catalogCommandRepository;


        public CreateCatalogHandler(ICatalogCommandRepository catalogCommandRepository)
        {
            _catalogCommandRepository = catalogCommandRepository;
        }

        public async Task<Response<CreateCatalogResponse>> Handle(CreateCatalogCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateCatalogValidator validator = new CreateCatalogValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateCatalogResponse>(new Exception(errors.ToString()));
                }

                Catalog newObject = AgronomicMapper.Mapper.Map<Catalog>(command);
                newObject.CreatedBy = _catalogCommandRepository.GetSessionUserId();
                newObject.Active = true;

                var createObjectResult = await _catalogCommandRepository.CreateAsync(newObject);
                if (createObjectResult != null)
                {
                    CreateCatalogResponse createObjectResponse = AgronomicMapper.Mapper.Map<CreateCatalogResponse>(createObjectResult);
                    return new Response<CreateCatalogResponse>(createObjectResponse);
                }
                return new Response<CreateCatalogResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateCatalogResponse>(ex);
            }
        }
    }
}
