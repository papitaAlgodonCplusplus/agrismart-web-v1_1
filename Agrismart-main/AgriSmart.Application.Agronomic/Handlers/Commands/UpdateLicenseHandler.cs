using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateLicenseHandler : IRequestHandler<UpdateLicenseCommand, Response<UpdateLicenseResponse>>
    {
        private readonly ILicenseCommandRepository _licenseCommandRepository;
        private readonly ILicenseQueryRepository _licenseQueryRepository;

        public UpdateLicenseHandler(ILicenseCommandRepository licenseCommandRepository, ILicenseQueryRepository licenseQueryRepository)
        {
            _licenseCommandRepository = licenseCommandRepository;
            _licenseQueryRepository = licenseQueryRepository;            
        }

        public async Task<Response<UpdateLicenseResponse>> Handle(UpdateLicenseCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateLicenseValidator validator = new UpdateLicenseValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateLicenseResponse>(new Exception(errors.ToString()));
                }

                License getResult = await _licenseQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.ExpirationDate = command.ExpirationDate;
                    getResult.AllowedCompanies = command.AllowedCompanies;
                    getResult.AllowedFarms = command.AllowedFarms;
                    getResult.AllowedUsers = command.AllowedUsers;
                    getResult.AllowedProductionUnits = command.AllowedProductionUnits;
                    getResult.AllowedCropProductions = command.AllowedCropProductions;
                    getResult.Active = command.Active;
                }

                License updateLicenseResult = await _licenseCommandRepository.UpdateAsync(getResult);

                if (updateLicenseResult != null)
                {
                    UpdateLicenseResponse updateLicenseResponse = AgronomicMapper.Mapper.Map<UpdateLicenseResponse>(updateLicenseResult);

                    return new Response<UpdateLicenseResponse>(updateLicenseResponse);
                }
                return new Response<UpdateLicenseResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateLicenseResponse>(ex);
            }
        }
    }
}
