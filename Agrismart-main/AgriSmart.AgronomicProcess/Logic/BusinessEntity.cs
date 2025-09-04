using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Entities;
using AgriSmart.AgronomicProcess.Models;
using AgriSmart.AgronomicProcess.Services;
using AgriSmart.AgronomicProcess.Services.Responses;

namespace AgriSmart.AgronomicProcess.Logic
{
    public class BusinessEntity
    {
        private readonly AgronomicProcessConfiguration _agronomicProcessConfiguration;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;

        private readonly ILogger _logger;

        private IList<Company> _companies;

        private string _token = string.Empty;

        private IAgriSmartApiClient _agriSmartApiClient;

        public BusinessEntity(ILogger logger, AgronomicProcessConfiguration agronomicProcessConfiguration, AgrismartApiConfiguration agrismartApiConfiguration, IAgriSmartApiClient agriSmartApiClient)
        { 
            _logger = logger;
            _agronomicProcessConfiguration = agronomicProcessConfiguration;
            _agrismartApiConfiguration = agrismartApiConfiguration;
            _agriSmartApiClient = agriSmartApiClient;
        }
        public async Task<LoginResponse> CreateApiSessionAsync()
        {
            try
            {
                return await _agriSmartApiClient.CreateSession("agronomicProcess", "123");

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login failed.");
                throw;
            }
        }
        public async Task<IList<Company>> CreateBusinessEntityAsync(string token)
        {
            _token = token;

            _companies = await _agriSmartApiClient.GetCompanies(token);

            foreach (var company in _companies)
            {
                company.Farms = await _agriSmartApiClient.GetFarms(company.Id, token);

                foreach (var farm in company.Farms)
                {
                    farm.Company = company;
                    farm.ProductionUnits = await _agriSmartApiClient.GetProductionUnits(farm.Id, token);

                    foreach (var productionUnit in farm.ProductionUnits)
                    {
                        productionUnit.Farm = farm;
                        productionUnit.CropProductions = await _agriSmartApiClient.GetCropProductions(productionUnit.Id, token);

                        foreach (var cropProduction in productionUnit.CropProductions)
                        {
                            cropProduction.ProductionUnit = productionUnit;
                            cropProduction.Devices = await _agriSmartApiClient.GetDevices(cropProduction.Id, token);
                        }
                    }
                }
            }

            return _companies;
        }
        public IList<Device> GetDevices()
        {
            IList<Device> devices = new List<Device>();

            foreach (Company company in _companies)
            {
                foreach (Farm farm in company.Farms)
                {
                    foreach (ProductionUnit productionUnit in farm.ProductionUnits)
                    {
                        foreach (CropProduction cropProduction in productionUnit.CropProductions)
                        {
                            foreach (Device device in cropProduction.Devices)
                            {
                                devices.Add(device);
                            }
                        }
                    }
                }

            }

            return devices;
        }
        public IList<CropProduction> GetCropProductions()
        {
            IList<CropProduction> cropProductions = new List<CropProduction>();

            foreach (Company company in _companies)
            {
                foreach (Farm farm in company.Farms)
                {
                    foreach (ProductionUnit productionUnit in farm.ProductionUnits)
                    {
                        foreach (CropProduction cropProduction in productionUnit.CropProductions)
                        {
                            cropProductions.Add(cropProduction);
                        }
                    }
                }
            }

            return cropProductions;
        }
        public async Task<IList<CropProductionEntity>> GetCropProductionEntities(string token)
        {
            IList<CropProductionEntity> cropProductionEntities = new List<CropProductionEntity>();

            foreach (Company company in _companies)
            {
                foreach (Farm farm in company.Farms)
                {
                    farm.Company = company;

                    foreach (ProductionUnit productionUnit in farm.ProductionUnits)
                    {
                        productionUnit.Farm = farm;

                        foreach (CropProduction cropProduction in productionUnit.CropProductions)
                        {
                            CropProductionEntity cropProductionEntity = new CropProductionEntity(cropProduction);

                            Crop crop = await _agriSmartApiClient.GetCrop(cropProduction.CropId, token);
                            cropProductionEntity.Crop = new CropEntity(crop);

                            cropProductionEntity.ProductionUnit = new ProductionUnitEntity(productionUnit);
                            
                            Container container = await _agriSmartApiClient.GetContainer(cropProduction.ContainerId, token);
                            cropProductionEntity.Container = new ContainerEntity(container);

                            Dropper dropper = await _agriSmartApiClient.GetDropper(cropProduction.DropperId, token);
                            cropProductionEntity.Dropper = new DropperEntity(dropper);

                            GrowingMedium growingMedium = await _agriSmartApiClient.GetGrowingMedium(cropProduction.GrowingMediumId, token);
                            cropProductionEntity.GrowingMedium = new GrowingMediumEntity(growingMedium);

                            cropProductionEntities.Add(cropProductionEntity);
                        }
                    }
                }
            }

            return cropProductionEntities;
        }
    }
}
