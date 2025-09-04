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
    public class UpdateWaterChemistryHandler : IRequestHandler<UpdateWaterChemistryCommand, Response<UpdateWaterChemistryResponse>>
    {
        private readonly IWaterChemistryCommandRepository _WaterChemistryCommandRepository;
        private readonly IWaterChemistryQueryRepository _WaterChemistryQueryRepository;

        public UpdateWaterChemistryHandler(IWaterChemistryCommandRepository WaterChemistryCommandRepository, IWaterChemistryQueryRepository WaterChemistryQueryRepository)
        {
            _WaterChemistryCommandRepository = WaterChemistryCommandRepository;
            _WaterChemistryQueryRepository = WaterChemistryQueryRepository;
        }

        public async Task<Response<UpdateWaterChemistryResponse>> Handle(UpdateWaterChemistryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateWaterChemistryValidator validator = new UpdateWaterChemistryValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateWaterChemistryResponse>(new Exception(errors.ToString()));
                }

                WaterChemistry getResult = await _WaterChemistryQueryRepository.GetByIdAsync(command.Id);
                if (getResult != null)
                {
                    getResult.WaterId = command.WaterId;
                    getResult.Ca = command.Ca;
                    getResult.K = command.K;
                    getResult.Mg = command.Mg;
                    getResult.Na = command.Na;
                    getResult.NH4 = command.NH4;
                    getResult.Fe = command.Fe;
                    getResult.Cu = command.Cu;
                    getResult.Mn = command.Mn;
                    getResult.Zn = command.Zn;
                    getResult.NO3 = command.NO3;
                    getResult.SO4 = command.SO4;
                    getResult.Cl = command.Cl;
                    getResult.B = command.B;
                    getResult.H2PO4 = command.H2PO4;
                    getResult.HCO3 = command.HCO3;
                    getResult.BO4 = command.BO4;
                    getResult.MOO4 = command.MOO4;
                    getResult.EC = command.EC;
                    getResult.pH = command.pH;
                    getResult.AnalysisDate = command.AnalysisDate;
                    getResult.Active = command.Active;
                    getResult.UpdatedBy = _WaterChemistryCommandRepository.GetSessionUserId();
                    getResult.DateUpdated = DateTime.Now;
                }

                WaterChemistry updateObjectResult = await _WaterChemistryCommandRepository.UpdateAsync(getResult);
                if (updateObjectResult != null)
                {
                    UpdateWaterChemistryResponse updateObjectResponse = AgronomicMapper.Mapper.Map<UpdateWaterChemistryResponse>(updateObjectResult);
                    return new Response<UpdateWaterChemistryResponse>(updateObjectResponse);
                }
                return new Response<UpdateWaterChemistryResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateWaterChemistryResponse>(ex);
            }
        }
    }
}
