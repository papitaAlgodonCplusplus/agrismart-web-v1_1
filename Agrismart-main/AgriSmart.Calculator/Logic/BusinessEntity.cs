using AgriSmart.Calculator.Configuration;
using AgriSmart.Calculator.Models;
using AgriSmart.Calculator.Services;
using AgriSmart.Calculator.Services.Responses;
using Microsoft.Extensions.Logging;

namespace AgriSmart.Calculator.Logic
{
    public class BusinessEntity
    {
        //private readonly AgronomicProcessConfiguration _agronomicProcessConfiguration;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;

        private readonly ILogger _logger;

        private IList<Company> _companies;

        private string _token = string.Empty;

        public BusinessEntity(ILogger logger, AgrismartApiConfiguration agrismartApiConfiguration)
        { 
            _logger = logger;
            //_agronomicProcessConfiguration = agronomicProcessConfiguration;
            _agrismartApiConfiguration = agrismartApiConfiguration;
        }

        public LoginResponse CreateApiSession()
        {
            using (AgriSmartApiClient agriSmartApiClient = new(_token, _logger, _agrismartApiConfiguration))
            {
                return agriSmartApiClient.CreateSession("agronomicProcess", "123").Result;
            }
        }

        public void CreateBusinessEntity(string token)
        {
            _token = token;
            LoadCompanies();
            LoadFarms();
            LoadProductionUnits();
            LoadCropProductions();
            LoadDevices();
        }

        /// <summary>
        /// Loads all the companies for the selected client
        /// </summary>
        private void LoadCompanies()
        {
            using (AgriSmartApiClient agriSmartApiClient = new (_token, _logger, _agrismartApiConfiguration))
            {
                _companies = agriSmartApiClient.GetCompanies().Result;
            }
        }

        /// <summary>
        /// Loads all the farms for all the companies for the selected client
        /// </summary>
        private void LoadFarms()
        {
            using (AgriSmartApiClient agriSmartApiClient = new(_token, _logger, _agrismartApiConfiguration))
            {
                foreach (Company company in _companies)
                {
                    company.Farms = agriSmartApiClient.GetFarms(company.Id).Result;
                }               
            }
        }

        /// <summary>
        /// Loads all the production units for the all the farms for all the companies for the selected client
        /// </summary>
        private void LoadProductionUnits()
        {
            using (AgriSmartApiClient agriSmartApiClient = new(_token, _logger, _agrismartApiConfiguration))
            {
                foreach (Company company in _companies)
                {
                    foreach (Farm farm in company.Farms)
                    { 
                        farm.ProductionUnits = agriSmartApiClient.GetProductionUnits(farm.Id).Result;
                    }
                }
            }
        }

        private void LoadCropProductions()
        {
            using (AgriSmartApiClient agriSmartApiClient = new(_token, _logger, _agrismartApiConfiguration))
            {
                foreach (Company company in _companies)
                {
                    foreach (Farm farm in company.Farms)
                    {
                        foreach (ProductionUnit productionUnit in farm.ProductionUnits)
                        {
                            productionUnit.CropProductions = agriSmartApiClient.GetCropProductions(productionUnit.Id).Result;
                        }
                    }
                }
            }
        }
        private void LoadDevices()
        {
            using (AgriSmartApiClient agriSmartApiClient = new(_token, _logger, _agrismartApiConfiguration))
            {
                foreach (Company company in _companies)
                {
                    foreach (Farm farm in company.Farms)
                    {
                        foreach (ProductionUnit productionUnit in farm.ProductionUnits)
                        {
                            foreach (CropProduction cropProduction in productionUnit.CropProductions)
                            {
                                cropProduction.Devices = agriSmartApiClient.GetDevices(cropProduction.Id).Result;
                            }
                        }
                    }
                }
            }
        }

        public IList<Device> GetDevices()
        {
            IList<Device> devices = new List<Device>();
            using (AgriSmartApiClient agriSmartApiClient = new(_token, _logger, _agrismartApiConfiguration))
            {
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
            }
            return devices;
        }

        public IList<CropProduction> GetCropProductions()
        {
            IList<CropProduction> cropProductions = new List<CropProduction>();

            using (AgriSmartApiClient agriSmartApiClient = new(_token, _logger, _agrismartApiConfiguration))
            {
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
            }
            return cropProductions;
        }
    }
}
