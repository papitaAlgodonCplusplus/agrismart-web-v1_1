
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CreateFertilizerHandler : IRequestHandler<CreateFertilizerCommand, Response<CreateFertilizerResponse>>
    {
        private readonly IFertilizerCommandRepository _fertilizerCommandRepository;

        public CreateFertilizerHandler(IFertilizerCommandRepository fertilizerCommandRepository)
        {
            _fertilizerCommandRepository = fertilizerCommandRepository;
        }

        public async Task<Response<CreateFertilizerResponse>> Handle(CreateFertilizerCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateFertilizerValidator validator = new CreateFertilizerValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateFertilizerResponse>(new Exception(errors.ToString()));
                }

                Fertilizer newFertilizer = new Fertilizer
                {
                    // Existing properties
                    CatalogId = command.CatalogId,
                    Name = command.Name,
                    Manufacturer = command.Manufacturer,
                    IsLiquid = command.IsLiquid,
                    Active = command.Active,

                    // NEW PROPERTIES MAPPING
                    
                    // Basic Information
                    Brand = command.Brand,
                    Description = command.Description,
                    Type = command.Type,
                    Formulation = command.Formulation,
                    Concentration = command.Concentration,
                    ConcentrationUnit = command.ConcentrationUnit,
                    ApplicationMethod = command.ApplicationMethod,

                    // NPK and Nutrient Percentages
                    NitrogenPercentage = command.NitrogenPercentage,
                    PhosphorusPercentage = command.PhosphorusPercentage,
                    PotassiumPercentage = command.PotassiumPercentage,
                    Micronutrients = command.Micronutrients,

                    // Stock Management
                    CurrentStock = command.CurrentStock,
                    MinimumStock = command.MinimumStock,
                    StockUnit = command.StockUnit,
                    PricePerUnit = command.PricePerUnit,
                    Supplier = command.Supplier,

                    // Storage and Application
                    ExpirationDate = command.ExpirationDate,
                    StorageInstructions = command.StorageInstructions,
                    ApplicationInstructions = command.ApplicationInstructions,

                    // Chemical Analysis Parameters
                    Ca = command.Ca,
                    K = command.K,
                    Mg = command.Mg,
                    Na = command.Na,
                    NH4 = command.NH4,
                    N = command.N,
                    SO4 = command.SO4,
                    S = command.S,
                    Cl = command.Cl,
                    H2PO4 = command.H2PO4,
                    P = command.P,
                    HCO3 = command.HCO3,

                    // Micronutrients Analysis
                    Fe = command.Fe,
                    Mn = command.Mn,
                    Zn = command.Zn,
                    Cu = command.Cu,
                    B = command.B,
                    Mo = command.Mo,

                    // Solution Properties
                    TDS = command.TDS,
                    EC = command.EC,
                    PH = command.PH
                };

                Fertilizer createFertilizerResult = await _fertilizerCommandRepository.CreateAsync(newFertilizer);

                if (createFertilizerResult != null)
                {
                    CreateFertilizerResponse createFertilizerResponse = new CreateFertilizerResponse()
                    {
                        // Existing properties
                        Id = createFertilizerResult.Id,
                        Name = createFertilizerResult.Name,
                        Manufacturer = createFertilizerResult.Manufacturer,
                        IsLiquid = createFertilizerResult.IsLiquid,
                        Active = createFertilizerResult.Active,

                        // NEW PROPERTIES MAPPING

                        // Basic Information
                        Brand = createFertilizerResult.Brand,
                        Description = createFertilizerResult.Description,
                        Type = createFertilizerResult.Type,
                        Formulation = createFertilizerResult.Formulation,
                        Concentration = createFertilizerResult.Concentration,
                        ConcentrationUnit = createFertilizerResult.ConcentrationUnit,
                        ApplicationMethod = createFertilizerResult.ApplicationMethod,

                        // NPK and Nutrient Percentages
                        NitrogenPercentage = createFertilizerResult.NitrogenPercentage,
                        PhosphorusPercentage = createFertilizerResult.PhosphorusPercentage,
                        PotassiumPercentage = createFertilizerResult.PotassiumPercentage,
                        Micronutrients = createFertilizerResult.Micronutrients,

                        // Stock Management
                        CurrentStock = createFertilizerResult.CurrentStock,
                        MinimumStock = createFertilizerResult.MinimumStock,
                        StockUnit = createFertilizerResult.StockUnit,
                        PricePerUnit = createFertilizerResult.PricePerUnit,
                        Supplier = createFertilizerResult.Supplier,

                        // Storage and Application
                        ExpirationDate = createFertilizerResult.ExpirationDate,
                        StorageInstructions = createFertilizerResult.StorageInstructions,
                        ApplicationInstructions = createFertilizerResult.ApplicationInstructions,

                        // Chemical Analysis Parameters
                        Ca = createFertilizerResult.Ca,
                        K = createFertilizerResult.K,
                        Mg = createFertilizerResult.Mg,
                        Na = createFertilizerResult.Na,
                        NH4 = createFertilizerResult.NH4,
                        N = createFertilizerResult.N,
                        SO4 = createFertilizerResult.SO4,
                        S = createFertilizerResult.S,
                        Cl = createFertilizerResult.Cl,
                        H2PO4 = createFertilizerResult.H2PO4,
                        P = createFertilizerResult.P,
                        HCO3 = createFertilizerResult.HCO3,

                        // Micronutrients Analysis
                        Fe = createFertilizerResult.Fe,
                        Mn = createFertilizerResult.Mn,
                        Zn = createFertilizerResult.Zn,
                        Cu = createFertilizerResult.Cu,
                        B = createFertilizerResult.B,
                        Mo = createFertilizerResult.Mo,

                        // Solution Properties
                        TDS = createFertilizerResult.TDS,
                        EC = createFertilizerResult.EC,
                        PH = createFertilizerResult.PH
                    };

                    return new Response<CreateFertilizerResponse>(createFertilizerResponse);
                }

                return new Response<CreateFertilizerResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateFertilizerResponse>(ex);
            }
        }
    }
}