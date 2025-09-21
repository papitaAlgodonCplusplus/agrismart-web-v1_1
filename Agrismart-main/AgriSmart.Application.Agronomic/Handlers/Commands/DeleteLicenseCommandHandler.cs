using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteLicenseCommandHandler : IRequestHandler<DeleteLicenseCommand, Response<DeleteLicenseResponse>>
    {
        private readonly ILicenseCommandRepository _licenseCommandRepository;

        public DeleteLicenseCommandHandler(ILicenseCommandRepository licenseCommandRepository)
        {
            _licenseCommandRepository = licenseCommandRepository;
        }

        public async Task<Response<DeleteLicenseResponse>> Handle(DeleteLicenseCommand command, CancellationToken cancellationToken)
        {
            try
            {
                License deleteLicense = AgronomicMapper.Mapper.Map<License>(command);

                await _licenseCommandRepository.DeleteAsync(deleteLicense);

                return new Response<DeleteLicenseResponse>(new DeleteLicenseResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteLicenseResponse>(ex);
            }
        }
    }
}