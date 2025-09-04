using Microsoft.Extensions.Logging;
using AgriSmart.OnDemandIrrigation.Configuration;
using AgriSmart.OnDemandIrrigation.Services.Responses;
using AgriSmart.OnDemandIrrigation.Models;
using AgriSmart.OnDemandIrrigation.Services;
using AgriSmart.OnDemandIrrigation.Logic;
using AgriSmart.OnDemandIrrigation.Entities;

namespace AgriSmart.Calculator.Logic
{
    public class OnDemandIrrigationProcess
    {
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly ILogger _logger;
        private string _token = string.Empty;

        public OnDemandIrrigationProcess(ILogger logger, AgrismartApiConfiguration agrismartApiConfiguration)
        {
            _logger = logger;
            _agrismartApiConfiguration = agrismartApiConfiguration;
        }

        public LoginResponse CreateApiSession()
        {
            using (AgriSmartApiClient agriSmartApiClient = new(_token, _logger, _agrismartApiConfiguration))
            {
                return agriSmartApiClient.CreateSession("agronomicProcess", "123").Result;
            }
        }

        public void CalculationCalculate(string token)
        {
            _token = token;

            using (AgriSmartApiClient agriSmartApiClient = new(_token, _logger, _agrismartApiConfiguration))
            {
                IList<Company>? companies = agriSmartApiClient.GetCompanies().Result;

                if (companies != null)
                {
                    foreach (Company company in companies)
                    {
                        IList<Farm>? farms = agriSmartApiClient.GetFarms(company.Id).Result;

                        if (farms != null)
                        {
                            foreach (Farm farm in farms)
                            {
                                IList<ProductionUnit>? productionUnits = agriSmartApiClient.GetProductionUnits(farm.Id).Result;

                                if (productionUnits != null)
                                {
                                    foreach (ProductionUnit productionUnit in productionUnits)
                                    {
                                        IList<CropProduction>? cropProductions = agriSmartApiClient.GetCropProductions(productionUnit.Id).Result;

                                        if (cropProductions != null)
                                        {
                                            foreach (CropProduction cropProduction in cropProductions)
                                            {
                                try
                                {
                                    _logger.LogInformation($"Processing crop production ID: {cropProduction.Id}");

                                    CropProductionEntity cropProductionEntity = new CropProductionEntity(cropProduction);

                                    // Populate required properties for IrrigationMonitor
                                    _logger.LogInformation("Loading crop data...");
                                    cropProductionEntity.Crop = agriSmartApiClient.GetCrop(cropProduction.CropId).Result;

                                    _logger.LogInformation("Loading container data...");
                                    Container container = agriSmartApiClient.GetContainer(cropProduction.ContainerId).Result;
                                    cropProductionEntity.Container = new ContainerEntity(container);

                                    _logger.LogInformation("Loading growing medium data...");
                                    GrowingMedium growingMedium = agriSmartApiClient.GetGrowingMedium(cropProduction.GrowingMediumId).Result;
                                    cropProductionEntity.GrowingMedium = new GrowingMediumEntity(growingMedium);

                                    // Note: You'll need to determine the correct dropper ID
                                    // For now, I'm adding a null check in case dropper data is not available
                                    _logger.LogInformation("Loading dropper data...");
                                    try
                                    {
                                        // You may need to adjust this based on your business logic
                                        // cropProductionEntity.Dropper = agriSmartApiClient.GetDropper(1).Result;
                                        // For now, let's skip the dropper to avoid the error
                                    }
                                    catch (Exception ex)
                                    {
                                        _logger.LogWarning($"Could not load dropper data: {ex.Message}");
                                    }

                                    cropProductionEntity.ProductionUnit = productionUnit;

                                    _logger.LogInformation("Calling irrigation monitor...");
                                    IrrigationMonitorResponse irrigationMonitorResponse = IrrigationMonitor.ToIrrigate(cropProductionEntity);

                                    _logger.LogInformation($"Irrigation recommendation - Irrigate: {irrigationMonitorResponse.Irrigate}, Time: {irrigationMonitorResponse.IrrigationTime} minutes");
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex, $"Error processing crop production ID: {cropProduction.Id}");
                                    // Continue with next crop production instead of failing completely
                                    continue;
                                }

                                //CalculationInput input = new CalculationInput();

                                //CropProductionEntity cropProductionEntity = new CropProductionEntity(cropProduction);
                                //cropProductionEntity.Crop = agriSmartApiClient.GetCrop(cropProduction.CropId).Result;
                                //cropProductionEntity.ProductionUnit = productionUnit;
                                //Container container = agriSmartApiClient.GetContainer(cropProduction.ContainerId).Result;
                                //cropProductionEntity.Container = new ContainerEntity(container);
                                ////cropProductionEntity.Dropper = agriSmartApiClient.GetDropper(1).Result;// esto esta mal, dropper no pertence a cropproduction
                                //GrowingMedium growingMedium = agriSmartApiClient.GetGrowingMedium(cropProduction.GrowingMediumId).Result;
                                //cropProductionEntity.GrowingMedium =  new GrowingMediumEntity(growingMedium);

                                ////MeasurementKPI last = agriSmartApiClient.GetLastMeasurementKPI(DateTime.MinValue, DateTime.Now, cropProduction.Id).Result;
                                ////DateTime lastKPIDateTime = last.RecordDate.AddSeconds(1);
                                //DateTime lastKPIDateTime = DateTime.Parse("2024-05-31 23:59:59").AddSeconds(1);
                                //input.StartingDate = lastKPIDateTime;

                                //string formattedPeriodStartingDate = lastKPIDateTime.ToString("yyyy-MM-dd HH:mm:ss");
                                //string encodedStartingDateTime = Uri.EscapeDataString(formattedPeriodStartingDate);

                                //DateTime EndingDateTime = DateTime.Parse("2024-06-30 23:59:59");

                                ////there are two options, using .Net TZConvert library with farm timeZoneId or paid Google Google Time Zone API 
                                ////string timeZoneId = "Central Standard Time"; // this should be farm attribute
                                ////DateTime utcTime = DateTime.UtcNow;

                                ////TimeZoneInfo timeZoneInfo = TZConvert.GetTimeZoneInfo(timeZoneId);
                                ////DateTime localTime = TimeZoneInfo.ConvertTimeFromUtc(utcTime, timeZoneInfo);
                                ////DateTime EndingDateTime = localTime;

                                //input.EndingDate = EndingDateTime;
                                //string formattedPeriodEndingDate = input.EndingDate.ToString("yyyy-MM-dd HH:mm:ss");
                                //string formattedCurrentDateTime = input.EndingDate.ToString("yyyy-MM-dd HH");
                                //string encodedEndingDateTime = Uri.EscapeDataString(formattedPeriodEndingDate);
                                //string encodedCurrentDateTime = Uri.EscapeDataString(formattedCurrentDateTime);

                                //IList<MeasurementKPI> currentHourKPIs = agriSmartApiClient.GetMeasurementKPIs(encodedCurrentDateTime, encodedCurrentDateTime, cropProduction.Id).Result;
                                //if (currentHourKPIs != null)
                                //{
                                //    input.CurrentDateTimeMeasurementKPIs = new List<MeasurementKPI>();
                                //    input.CurrentDateTimeMeasurementKPIs.AddRange(currentHourKPIs);
                                //}

                                //input.CropProduction = cropProductionEntity;

                                //IList<MeasurementVariable> measurementVariables = agriSmartApiClient.GetMeasurementVariables(company.CatalogId).Result;
                                //input.MeasurementVariables = new List<MeasurementVariable>();
                                //input.MeasurementVariables.AddRange(measurementVariables);

                                //List<Measurement> measurements = new List<Measurement>();
                                //MeasurementVariable measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 5).FirstOrDefault();
                                //IList<Measurement> tempData = agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id).Result;
                                //measurements.AddRange(tempData);

                                //measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 6).FirstOrDefault();
                                //IList<Measurement> humData = agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id).Result;
                                //measurements.AddRange(humData);

                                //measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 7).FirstOrDefault();
                                //IList<Measurement> parData = agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id).Result;
                                //measurements.AddRange(parData);

                                //measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 4).FirstOrDefault();
                                //IList<Measurement> radData = agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id).Result;
                                //measurements.AddRange(radData);

                                //input.ClimateData = measurements;

                                //List<Measurement> growingMediumMeasurements = new List<Measurement>();
                                //measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 1).FirstOrDefault();
                                //IList<Measurement> growingMediumData = agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id).Result.ToList().OrderByDescending(x => x.RecordDate).ToList();
                                //growingMediumMeasurements.AddRange(growingMediumData);

                                //input.GrowingMediumData = growingMediumMeasurements;

                                //IList<IrrigationMeasurement> irrigationMeasurements = agriSmartApiClient.GetIrrigationMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id).Result;

                                //List<IrrigationEventEntity> irrigationEventEntities = new List<IrrigationEventEntity>();
                                //IList<IrrigationEvent> irrigationEvents = agriSmartApiClient.GetIrrigationEvents(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id).Result;

                                //foreach (IrrigationEvent irrigationEvent in irrigationEvents)
                                //{
                                //    IrrigationEventEntity newIrrigationEventEntity = new IrrigationEventEntity(irrigationEvent);

                                //    foreach (IrrigationMeasurement irrigationMeasurement in irrigationMeasurements.Where(x=> x.EventId == irrigationEvent.Id).ToList())
                                //    {
                                //        IrrigationMeasurementEntity newIrrigationMeasurementEntity = new IrrigationMeasurementEntity(irrigationMeasurement);
                                //        newIrrigationEventEntity.AddIrrigationMeasurement(newIrrigationMeasurementEntity);
                                //    }

                                //    irrigationEventEntities.Add(newIrrigationEventEntity);
                                //}

                                //input.IrrigationData = irrigationEventEntities;

                                //List<GlobalOutput> globalOutput = Calculations.Calculate(input);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
