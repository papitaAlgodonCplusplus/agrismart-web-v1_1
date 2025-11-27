
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateFertilizerHandler : IRequestHandler<UpdateFertilizerCommand, Response<UpdateFertilizerResponse>>
    {
        private readonly IFertilizerCommandRepository _fertilizerCommandRepository;
        private readonly IFertilizerQueryRepository _fertilizerQueryRepository;

        public UpdateFertilizerHandler(IFertilizerCommandRepository fertilizerCommandRepository, IFertilizerQueryRepository fertilizerQueryRepository)
        {
            _fertilizerCommandRepository = fertilizerCommandRepository;
            _fertilizerQueryRepository = fertilizerQueryRepository;
        }

        public async Task<Response<UpdateFertilizerResponse>> Handle(UpdateFertilizerCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateFertilizerValidator validator = new UpdateFertilizerValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateFertilizerResponse>(new Exception(errors.ToString()));
                }

                Fertilizer getResult = await _fertilizerQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    // Existing properties update
                    getResult.Name = command.Name;
                    getResult.Manufacturer = command.Manufacturer;
                    getResult.IsLiquid = command.IsLiquid;
                    getResult.Active = command.Active;

                    // NEW PROPERTIES UPDATE

                    // Basic Information
                    getResult.Brand = command.Brand;
                    getResult.Description = command.Description;
                    getResult.Type = command.Type;
                    getResult.Formulation = command.Formulation;
                    getResult.Concentration = command.Concentration;
                    getResult.ConcentrationUnit = command.ConcentrationUnit;
                    getResult.ApplicationMethod = command.ApplicationMethod;

                    // NPK and Nutrient Percentages
                    getResult.NitrogenPercentage = command.NitrogenPercentage;
                    getResult.PhosphorusPercentage = command.PhosphorusPercentage;
                    getResult.PotassiumPercentage = command.PotassiumPercentage;
                    getResult.Micronutrients = command.Micronutrients;

                    // Stock Management
                    getResult.CurrentStock = command.CurrentStock;
                    getResult.MinimumStock = command.MinimumStock;
                    getResult.StockUnit = command.StockUnit;
                    getResult.PricePerUnit = command.PricePerUnit;
                    getResult.Supplier = command.Supplier;

                    // Storage and Application
                    getResult.ExpirationDate = command.ExpirationDate;
                    getResult.StorageInstructions = command.StorageInstructions;
                    getResult.ApplicationInstructions = command.ApplicationInstructions;

                    // Chemical Analysis Parameters
                    getResult.Ca = command.Ca;
                    getResult.K = command.K;
                    getResult.Mg = command.Mg;
                    getResult.Na = command.Na;
                    getResult.NH4 = command.NH4;
                    getResult.N = command.N;
                    getResult.SO4 = command.SO4;
                    getResult.S = command.S;
                    getResult.Cl = command.Cl;
                    getResult.H2PO4 = command.H2PO4;
                    getResult.P = command.P;
                    getResult.HCO3 = command.HCO3;

                    // Micronutrients Analysis
                    getResult.Fe = command.Fe;
                    getResult.Mn = command.Mn;
                    getResult.Zn = command.Zn;
                    getResult.Cu = command.Cu;
                    getResult.B = command.B;
                    getResult.Mo = command.Mo;

                    // Solution Properties
                    getResult.TDS = command.TDS;
                    getResult.EC = command.EC;
                    getResult.PH = command.PH;

                    // Update audit fields
                    getResult.UpdatedBy = _fertilizerCommandRepository.GetSessionUserId();
                    getResult.DateUpdated = DateTime.Now;
                }

                Fertilizer updateFertilizerResult = await _fertilizerCommandRepository.UpdateAsync(getResult);

                if (updateFertilizerResult != null)
                {
                    UpdateFertilizerResponse updateFertilizerResponse = new UpdateFertilizerResponse()
                    {
                        // Existing properties
                        Id = updateFertilizerResult.Id,
                        Name = updateFertilizerResult.Name,
                        Manufacturer = updateFertilizerResult.Manufacturer,
                        IsLiquid = updateFertilizerResult.IsLiquid,
                        Active = updateFertilizerResult.Active,

                        // NEW PROPERTIES MAPPING

                        // Basic Information
                        Brand = updateFertilizerResult.Brand,
                        Description = updateFertilizerResult.Description,
                        Type = updateFertilizerResult.Type,
                        Formulation = updateFertilizerResult.Formulation,
                        Concentration = updateFertilizerResult.Concentration,
                        ConcentrationUnit = updateFertilizerResult.ConcentrationUnit,
                        ApplicationMethod = updateFertilizerResult.ApplicationMethod,

                        // NPK and Nutrient Percentages
                        NitrogenPercentage = updateFertilizerResult.NitrogenPercentage,
                        PhosphorusPercentage = updateFertilizerResult.PhosphorusPercentage,
                        PotassiumPercentage = updateFertilizerResult.PotassiumPercentage,
                        Micronutrients = updateFertilizerResult.Micronutrients,

                        // Stock Management
                        CurrentStock = updateFertilizerResult.CurrentStock,
                        MinimumStock = updateFertilizerResult.MinimumStock,
                        StockUnit = updateFertilizerResult.StockUnit,
                        PricePerUnit = updateFertilizerResult.PricePerUnit,
                        Supplier = updateFertilizerResult.Supplier,

                        // Storage and Application
                        ExpirationDate = updateFertilizerResult.ExpirationDate,
                        StorageInstructions = updateFertilizerResult.StorageInstructions,
                        ApplicationInstructions = updateFertilizerResult.ApplicationInstructions,

                        // Chemical Analysis Parameters
                        Ca = updateFertilizerResult.Ca,
                        K = updateFertilizerResult.K,
                        Mg = updateFertilizerResult.Mg,
                        Na = updateFertilizerResult.Na,
                        NH4 = updateFertilizerResult.NH4,
                        N = updateFertilizerResult.N,
                        SO4 = updateFertilizerResult.SO4,
                        S = updateFertilizerResult.S,
                        Cl = updateFertilizerResult.Cl,
                        H2PO4 = updateFertilizerResult.H2PO4,
                        P = updateFertilizerResult.P,
                        HCO3 = updateFertilizerResult.HCO3,

                        // Micronutrients Analysis
                        Fe = updateFertilizerResult.Fe,
                        Mn = updateFertilizerResult.Mn,
                        Zn = updateFertilizerResult.Zn,
                        Cu = updateFertilizerResult.Cu,
                        B = updateFertilizerResult.B,
                        Mo = updateFertilizerResult.Mo,

                        // Solution Properties
                        TDS = updateFertilizerResult.TDS,
                        EC = updateFertilizerResult.EC,
                        PH = updateFertilizerResult.PH
                    };

                    return new Response<UpdateFertilizerResponse>(updateFertilizerResponse);
                }

                return new Response<UpdateFertilizerResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateFertilizerResponse>(ex);
            }
        }
    }
}