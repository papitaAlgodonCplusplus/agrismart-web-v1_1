using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using System;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateFertilizerInputHandler : IRequestHandler<UpdateFertilizerInputCommand, Response<UpdateFertilizerInputResponse>>
    {
        private readonly IFertilizerInputCommandRepository _fertilizerInputCommandRepository;
        private readonly IFertilizerInputQueryRepository _fertilizerInputQueryRepository;

        public UpdateFertilizerInputHandler(IFertilizerInputCommandRepository fertilizerInputCommandRepository, IFertilizerInputQueryRepository fertilizerInputQueryRepository)
        {
            _fertilizerInputCommandRepository = fertilizerInputCommandRepository;
            _fertilizerInputQueryRepository = fertilizerInputQueryRepository;
        }

        public async Task<Response<UpdateFertilizerInputResponse>> Handle(UpdateFertilizerInputCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateFertilizerInputValidator validator = new UpdateFertilizerInputValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateFertilizerInputResponse>(new Exception(errors.ToString()));
                }

                FertilizerInput getResult = await _fertilizerInputQueryRepository.GetByIdAsync(command.Id);
                if (getResult != null)
                {
                    getResult.CatalogId = command.CatalogId;
                    getResult.InputPresentationId = command.CatalogId;
                    getResult.FertilizerId = command.CatalogId;
                    getResult.Name = command.Name;
                    getResult.Price = command.Price;
                    getResult.Active = command.Active;
                    getResult.UpdatedBy = _fertilizerInputCommandRepository.GetSessionUserId();
                    getResult.DateUpdated = DateTime.Now;
                }

                FertilizerInput updateObjectResult = await _fertilizerInputCommandRepository.UpdateAsync(getResult);
                if (updateObjectResult != null)
                {
                    UpdateFertilizerInputResponse updateObjectResponse = AgronomicMapper.Mapper.Map<UpdateFertilizerInputResponse>(updateObjectResult);
                    return new Response<UpdateFertilizerInputResponse>(updateObjectResponse);
                }
                return new Response<UpdateFertilizerInputResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateFertilizerInputResponse>(ex);
            }
        }
    }
}
