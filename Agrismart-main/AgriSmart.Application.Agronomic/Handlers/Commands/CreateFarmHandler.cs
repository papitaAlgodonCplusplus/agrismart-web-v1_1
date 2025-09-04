using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Resources;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CreateFarmHandler : IRequestHandler<CreateFarmCommand, Response<CreateFarmResponse>>
    {
        private readonly IFarmCommandRepository _farmCommandRepository;
        private readonly IUserFarmCommandRepository _userFarmCommandRepository;
        private readonly IFarmQueryRepository _farmQueryRepository;
        private readonly ILicenseQueryRepository _licenseQueryRepository;
        private readonly ICompanyQueryRepository _companyQueryRepository;

        public CreateFarmHandler(IFarmCommandRepository farmCommandRepository, IUserFarmCommandRepository userFarmCommandRepository, IFarmQueryRepository farmQueryRepository, ILicenseQueryRepository licenseQueryRepository, ICompanyQueryRepository companyQueryRepository)
        {
            _farmCommandRepository = farmCommandRepository;
            _userFarmCommandRepository = userFarmCommandRepository;
            _farmQueryRepository = farmQueryRepository;
            _licenseQueryRepository = licenseQueryRepository;
            _companyQueryRepository = companyQueryRepository;
        }

        public async Task<Response<CreateFarmResponse>> Handle(CreateFarmCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateFarmValidator validator = new CreateFarmValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateFarmResponse>(new Exception(errors.ToString()));
                }

                int activeCompanies = _farmQueryRepository.GetAllAsync(clientId: _companyQueryRepository.GetByIdAsync(command.CompanyId).Result.ClientId).Result.Count();
                int licenseFarms = _licenseQueryRepository.GetAllAsync(_farmCommandRepository.GetSessionClientId()).Result.ToList().OrderByDescending(p => p.ExpirationDate).FirstOrDefault().AllowedFarms;

                if (activeCompanies >= licenseFarms) return new Response<CreateFarmResponse>(new Exception("Max farms quantity reached"));

                int sessionUserId = _farmCommandRepository.GetSessionUserId();
                int sessionProfileId = _farmCommandRepository.GetSessionProfileId();
                Farm newFarm = AgronomicMapper.Mapper.Map<Farm>(command);

                newFarm.CreatedBy = sessionUserId;
                newFarm.Active = true;

                var createFarmResult = await _farmCommandRepository.CreateAsync(newFarm);

                if (createFarmResult != null)
                {
                    if (sessionProfileId == (int)Profiles.CompanyUser)
                    {
                        var createUserFarmResult = await _userFarmCommandRepository.CreateAsync(new UserFarm() { FarmId = createFarmResult.Id, UserId = sessionUserId, Active = true, CreatedBy = sessionUserId });
                    }
                    
                    CreateFarmResponse createFarmResponse = AgronomicMapper.Mapper.Map<CreateFarmResponse>(createFarmResult);

                    return new Response<CreateFarmResponse>(createFarmResponse);
                }
                return new Response<CreateFarmResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateFarmResponse>(ex);
            }
        }
    }
}
