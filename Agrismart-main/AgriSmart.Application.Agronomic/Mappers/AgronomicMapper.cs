using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class AgronomicMapper
    {
        private static readonly Lazy<IMapper> Lazy = new Lazy<IMapper>(() =>
        {
            var config = new MapperConfiguration(cfg =>
            {
                cfg.ShouldMapProperty = p => p.GetMethod.IsPublic || p.GetMethod.IsAssembly;
                cfg.AddProfile<ClientMappingProfile>();
                cfg.AddProfile<LicenseMappingProfile>();
                cfg.AddProfile<CompanyMappingProfile>();
                cfg.AddProfile<FarmMappingProfile>();
                cfg.AddProfile<ProductionUnitMappingProfile>();
                cfg.AddProfile<CropMappingProfile>();
                cfg.AddProfile<CropProductionMappingProfile>();
                cfg.AddProfile<CropProductionDeviceMappingProfile>();
                cfg.AddProfile<CropPhaseMappingProfile>();
                cfg.AddProfile<CropProductionIrrigationSectorMappingProfile>();
                cfg.AddProfile<FertilizerMappingProfile>();
                cfg.AddProfile<FertilizerInputMappingProfile>();
                cfg.AddProfile<FertilizerChemistryMappingProfile>();
                cfg.AddProfile<DeviceMappingProfile>(); 
                cfg.AddProfile<SensorMappingProfile>();
                cfg.AddProfile<DropperMappingProfile>();
                cfg.AddProfile<ContainerMappingProfile>();
                cfg.AddProfile<GrowingMediumMappingProfile>();
                cfg.AddProfile<CatalogMappingProfile>();
                cfg.AddProfile<UserMappingProfile>();
                cfg.AddProfile<UserFarmMappingProfile>();
                cfg.AddProfile<WaterMappingProfile>();
                cfg.AddProfile<WaterChemistryMappingProfile>();
                cfg.AddProfile<CropPhaseOptimalMappingProfile>();
                cfg.AddProfile<CropPhaseSolutionRequirementMappingProfile>();
                cfg.AddProfile<CalculationSettingMappingProfile>();
                cfg.AddProfile<RelayModuleMappingProfile>();
                cfg.AddProfile<RelayModuleCropProductionIrrigationSectorMappingProfile>();
                cfg.AddProfile<InputPresentationMappingProfile>();
                cfg.AddProfile<GraphMappingProfile>();
                cfg.AddProfile<AnalyticalEntityProfile>();
                cfg.AddProfile<MeasurementVariableMappingProfile>();
                cfg.AddProfile<IrrigationEventMappingProfile>();
                cfg.AddProfile<IrrigationMeasurementMappingProfile>();
                

            });

            var mapper = config.CreateMapper();
            return mapper;
        });

        public static IMapper Mapper => Lazy.Value;
    }
}
