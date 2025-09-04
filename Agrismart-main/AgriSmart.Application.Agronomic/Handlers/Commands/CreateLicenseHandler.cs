using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;
using System.Drawing;
using System.Security.Cryptography;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CreateLicenseHandler : IRequestHandler<CreateLicenseCommand, Response<CreateLicenseResponse>>
    {
        private readonly ILicenseCommandRepository _licenseCommandRepository;


        public CreateLicenseHandler(ILicenseCommandRepository licenseCommandRepository)
        {
            _licenseCommandRepository = licenseCommandRepository;
        }

        public async Task<Response<CreateLicenseResponse>> Handle(CreateLicenseCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateLicenseValidator validator = new CreateLicenseValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateLicenseResponse>(new Exception(errors.ToString()));
                }

                int sessionUserId = _licenseCommandRepository.GetSessionUserId();
                int sessionProfileId = _licenseCommandRepository.GetSessionProfileId();

                RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider();
                byte[] buff = new byte[32];
                rng.GetBytes(buff);
                string key = Convert.ToBase64String(buff);

                License newLicense = AgronomicMapper.Mapper.Map<License>(command);

                newLicense.Key = key;
                newLicense.CreatedBy = sessionUserId;
                newLicense.Active = true;

                var createLicenseResult = await _licenseCommandRepository.CreateAsync(newLicense);

                if (createLicenseResult != null)
                {
                    CreateLicenseResponse createLicenseResponse = AgronomicMapper.Mapper.Map<CreateLicenseResponse>(createLicenseResult);

                    return new Response<CreateLicenseResponse>(createLicenseResponse);
                }
                return new Response<CreateLicenseResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateLicenseResponse>(ex);
            }
        }
    }
}
