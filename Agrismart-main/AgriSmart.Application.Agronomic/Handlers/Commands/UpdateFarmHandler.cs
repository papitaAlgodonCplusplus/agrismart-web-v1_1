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
    public class UpdateFarmHandler : IRequestHandler<UpdateFarmCommand, Response<UpdateFarmResponse>>
    {
        private readonly IFarmCommandRepository _farmCommandRepository;
        private readonly IFarmQueryRepository _farmQueryRepository;

        public UpdateFarmHandler(IFarmCommandRepository farmCommandRepository, IFarmQueryRepository farmQueryRepository)
        {
            _farmCommandRepository = farmCommandRepository;
            _farmQueryRepository = farmQueryRepository;            
        }

        public async Task<Response<UpdateFarmResponse>> Handle(UpdateFarmCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateFarmValidator validator = new UpdateFarmValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateFarmResponse>(new Exception(errors.ToString()));
                }

                Farm getResult = await _farmQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.Name = command.Name;
                    getResult.Description = command.Description;
                    getResult.TimeZoneId = command.TimeZoneId;                        
                    getResult.Active = command.Active;
                }

                Farm updateFarmResult = await _farmCommandRepository.UpdateAsync(getResult);

                if (updateFarmResult != null)
                {
                    UpdateFarmResponse updateFarmResponse  = new UpdateFarmResponse()
                    {
                        Id = updateFarmResult.Id,
                        Name = updateFarmResult.Name,
                        Description = updateFarmResult.Description,
                        TimeZoneId = updateFarmResult.TimeZoneId,
                        Active = updateFarmResult.Active
                    };

                    return new Response<UpdateFarmResponse>(updateFarmResponse);
                }
                return new Response<UpdateFarmResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateFarmResponse>(ex);
            }
        }
    }
}
