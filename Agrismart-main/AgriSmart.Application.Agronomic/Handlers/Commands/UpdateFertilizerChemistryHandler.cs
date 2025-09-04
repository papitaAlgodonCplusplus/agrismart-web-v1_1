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
    public class UpdateFertilizerChemistryHandler : IRequestHandler<UpdateFertilizerChemistryCommand, Response<UpdateFertilizerChemistryResponse>>
    {
        private readonly IFertilizerChemistryCommandRepository _fertilizerChemistryCommandRepository;
        private readonly IFertilizerChemistryQueryRepository _fertilizerChemistryQueryRepository;

        public UpdateFertilizerChemistryHandler(IFertilizerChemistryCommandRepository fertilizerChemistryCommandRepository, IFertilizerChemistryQueryRepository fertilizerChemistryQueryRepository)
        {
            _fertilizerChemistryCommandRepository = fertilizerChemistryCommandRepository;
            _fertilizerChemistryQueryRepository = fertilizerChemistryQueryRepository;
        }

        public async Task<Response<UpdateFertilizerChemistryResponse>> Handle(UpdateFertilizerChemistryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateFertilizerChemistryValidator validator = new UpdateFertilizerChemistryValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateFertilizerChemistryResponse>(new Exception(errors.ToString()));
                }

                FertilizerChemistry getResult = await _fertilizerChemistryQueryRepository.GetByIdAsync(command.Id);
                if (getResult != null)
                {
                    getResult.FertilizerId = command.FertilizerId;
                    getResult.Purity = command.Purity;
                    getResult.Density = command.Density;
                    getResult.Solubility0 = command.Solubility0;
                    getResult.Solubility20 = command.Solubility20;
                    getResult.Solubility40 = command.Solubility40;
                    getResult.Formula = command.Formula;
                    getResult.Valence = command.Valence;
                    getResult.IsPhAdjuster = command.IsPhAdjuster;
                    getResult.Active = command.Active;
                    getResult.UpdatedBy = _fertilizerChemistryCommandRepository.GetSessionUserId();
                    getResult.DateUpdated = DateTime.Now;
                }

                FertilizerChemistry updateObjectResult = await _fertilizerChemistryCommandRepository.UpdateAsync(getResult);
                if (updateObjectResult != null)
                {
                    UpdateFertilizerChemistryResponse updateObjectResponse = AgronomicMapper.Mapper.Map<UpdateFertilizerChemistryResponse>(updateObjectResult);
                    return new Response<UpdateFertilizerChemistryResponse>(updateObjectResponse);
                }
                return new Response<UpdateFertilizerChemistryResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateFertilizerChemistryResponse>(ex);
            }
        }
    }
}
