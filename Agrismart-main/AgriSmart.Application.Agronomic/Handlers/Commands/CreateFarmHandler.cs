
// 6. Updated CreateFarmHandler
// File: 

using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Enums;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CreateFarmHandler : IRequestHandler<CreateFarmCommand, Response<CreateFarmResponse>>
    {
        private readonly IFarmCommandRepository _farmCommandRepository;
        private readonly IUserFarmCommandRepository _userFarmCommandRepository;

        public CreateFarmHandler(IFarmCommandRepository farmCommandRepository, IUserFarmCommandRepository userFarmCommandRepository)
        {
            _farmCommandRepository = farmCommandRepository;
            _userFarmCommandRepository = userFarmCommandRepository;
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

                int sessionUserId = _farmCommandRepository.GetSessionUserId();
                int sessionProfileId = _farmCommandRepository.GetSessionProfileId();
                
                Farm newFarm = new Farm()
                {
                    CompanyId = command.CompanyId,
                    Name = command.Name,
                    Description = command.Description,
                    TimeZoneId = command.TimeZoneId,
                    Location = command.Location,
                    Address = command.Address,
                    Area = command.Area,
                    Latitude = command.Latitude,
                    Longitude = command.Longitude,
                    Climate = command.Climate,
                    SoilType = command.SoilType,
                    CreatedBy = sessionUserId,
                    Active = true
                };

                var createFarmResult = await _farmCommandRepository.CreateAsync(newFarm);

                if (createFarmResult != null)
                {
                    if (sessionProfileId == (int)Profiles.CompanyUser)
                    {
                        var createUserFarmResult = await _userFarmCommandRepository.CreateAsync(new UserFarm() 
                        { 
                            FarmId = createFarmResult.Id, 
                            UserId = sessionUserId, 
                            Active = true, 
                            CreatedBy = sessionUserId 
                        });
                    }
                    
                    CreateFarmResponse createFarmResponse = new CreateFarmResponse()
                    {
                        Id = createFarmResult.Id,
                        CompanyId = createFarmResult.CompanyId,
                        Name = createFarmResult.Name,
                        Description = createFarmResult.Description,
                        TimeZoneId = createFarmResult.TimeZoneId,
                        Location = createFarmResult.Location,
                        Address = createFarmResult.Address,
                        Area = createFarmResult.Area,
                        Latitude = createFarmResult.Latitude,
                        Longitude = createFarmResult.Longitude,
                        Climate = createFarmResult.Climate,
                        SoilType = createFarmResult.SoilType,
                        Active = createFarmResult.Active
                    };

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