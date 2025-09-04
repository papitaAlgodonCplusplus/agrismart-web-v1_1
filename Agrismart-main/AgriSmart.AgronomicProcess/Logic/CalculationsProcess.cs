using AgriSmart.AgronomicProcess.Models;
using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Services.Responses;
using AgriSmart.AgronomicProcess.Services;
using AgriSmart.AgronomicProcess.Entities;
using TimeZoneConverter;
using TimeZone = AgriSmart.AgronomicProcess.Models.TimeZone;

namespace AgriSmart.AgronomicProcess.Logic
{
    public class CalculationsProcess
    {
        private MeasurementKPIEntity lastestMeasurermentKPI;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly IAgriSmartApiClient _agriSmartApiClient;
        private readonly ILogger _logger;
        private string _token = string.Empty;

        public CalculationsProcess(ILogger logger, AgrismartApiConfiguration agrismartApiConfiguration, IAgriSmartApiClient agriSmartApiClient)
        {
            _logger = logger;
            _agrismartApiConfiguration = agrismartApiConfiguration;
            _agriSmartApiClient = agriSmartApiClient;
        }

        public async Task<List<ProcessCalculationsResponse>> Calculate(IList<CropProductionEntity> cropProductions, string token, CancellationToken ct)
        {
            List<ProcessCalculationsResponse> responses = new List<ProcessCalculationsResponse>();

            foreach (CropProductionEntity cropProduction in cropProductions)
            {
                if (ct.IsCancellationRequested)
                    return null;

                IList<CalculationSetting> calculationSettings = await _agriSmartApiClient.GetCalculationSettings(cropProduction.ProductionUnit.Farm.Company.CatalogId, token);

                CalculationInput input = new CalculationInput();

                string formattedMinDate = DateTime.MinValue.ToString("yyyy-MM-dd HH:mm:ss");
                string formattedNowDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

                MeasurementKPI last = _agriSmartApiClient.GetLastMeasurementKPI(formattedMinDate, formattedNowDate, cropProduction.Id, token).Result;
                DateTime lastKPIDateTime = last.RecordDate.AddSeconds(1);
                input.StartingDate = lastKPIDateTime;

                string formattedPeriodStartingDate = lastKPIDateTime.ToString("yyyy-MM-dd HH:mm:ss");
                string encodedStartingDateTime = Uri.EscapeDataString(formattedPeriodStartingDate);

                TimeZoneInfo localTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time");
                DateTime EndingDateTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, localTimeZone);

                input.EndingDate = EndingDateTime;
                string formattedPeriodEndingDate = input.EndingDate.ToString("yyyy-MM-dd HH:mm:ss");
                string formattedCurrentDateTime = input.EndingDate.ToString("yyyy-MM-dd HH");
                string encodedEndingDateTime = Uri.EscapeDataString(formattedPeriodEndingDate);
                string encodedCurrentDateTime = Uri.EscapeDataString(formattedCurrentDateTime);

                IList<MeasurementKPI> currentHourKPIs = await _agriSmartApiClient.GetMeasurementKPIs(encodedCurrentDateTime, encodedCurrentDateTime, cropProduction.Id, token);
                
                if (currentHourKPIs != null)
                {
                    input.CurrentDateTimeMeasurementKPIs = new List<MeasurementKPI>();
                    input.CurrentDateTimeMeasurementKPIs.AddRange(currentHourKPIs);
                }

                input.CropProduction = cropProduction;

                IList<MeasurementVariable> measurementVariables = await _agriSmartApiClient.GetMeasurementVariables(cropProduction.ProductionUnit.Farm.Company.CatalogId, token);
                input.MeasurementVariables = new List<MeasurementVariable>();
                input.MeasurementVariables.AddRange(measurementVariables);

                List<Measurement> measurements = new List<Measurement>();
                CalculationSetting airTemperatureMeasurementVariableId = calculationSettings.Where(x => x.Name == "AirTemperature").FirstOrDefault();

                MeasurementVariable measurementVariable = measurementVariables.Where(x => x.Id == Convert.ToInt32(airTemperatureMeasurementVariableId.Value)).FirstOrDefault();
                IList<Measurement> tempData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
                measurements.AddRange(tempData);

                CalculationSetting airRelativeHumedityMeasurementVariableId = calculationSettings.Where(x => x.Name == "AirRelativeHumedity").FirstOrDefault();
                measurementVariable = measurementVariables.Where(x => x.Id == Convert.ToInt32(airRelativeHumedityMeasurementVariableId.Value)).FirstOrDefault();
                IList<Measurement> humData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
                measurements.AddRange(humData);

                CalculationSetting photoActiveRadiationMeasurementVariableId = calculationSettings.Where(x => x.Name == "PhotoActiveRadiaction").FirstOrDefault();
                measurementVariable = measurementVariables.Where(x => x.Id == Convert.ToInt32(photoActiveRadiationMeasurementVariableId.Value)).FirstOrDefault();
                IList<Measurement> parData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
                measurements.AddRange(parData);

                CalculationSetting solarRadiationMeasurementVariableId = calculationSettings.Where(x => x.Name == "SolarRadiaction").FirstOrDefault();
                measurementVariable = measurementVariables.Where(x => x.Id == Convert.ToInt32(photoActiveRadiationMeasurementVariableId.Value)).FirstOrDefault();
                IList<Measurement> radData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
                measurements.AddRange(radData);

                input.ClimateData = measurements;

                List<Measurement> growingMediumMeasurements = new List<Measurement>();

                CalculationSetting growingMediumVolumetricWaterContentMeasurementVariableId = calculationSettings.Where(x => x.Name == "GrowingMediumVolumetricWaterContent").FirstOrDefault();
                measurementVariable = measurementVariables.Where(x => x.Id == Convert.ToInt32(growingMediumVolumetricWaterContentMeasurementVariableId.Value)).FirstOrDefault();
                IList<Measurement> growingMediumData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
                growingMediumMeasurements.AddRange(growingMediumData.OrderByDescending(x => x.RecordDate).ToList());

                input.GrowingMediumData = growingMediumMeasurements;

                IrrigationEventProcess irrigationEventProcess = new IrrigationEventProcess(token, _logger, _agrismartApiConfiguration, _agriSmartApiClient);
                var x = await irrigationEventProcess.Process(cropProduction, calculationSettings, token);

                IList<IrrigationMeasurement> irrigationMeasurements = await _agriSmartApiClient.GetIrrigationMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, token);

                List<IrrigationEventEntity> irrigationEventEntities = new List<IrrigationEventEntity>();
                IList<IrrigationEvent> irrigationEvents = await _agriSmartApiClient.GetIrrigationEvents(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, token);

                foreach (IrrigationEvent irrigationEvent in irrigationEvents)
                {
                    IrrigationEventEntity newIrrigationEventEntity = new IrrigationEventEntity(irrigationEvent);

                    foreach (IrrigationMeasurement irrigationMeasurement in irrigationMeasurements.Where(x => x.EventId == irrigationEvent.Id).ToList())
                    {
                        IrrigationMeasurementEntity newIrrigationMeasurementEntity = new IrrigationMeasurementEntity(irrigationMeasurement);
                        newIrrigationEventEntity.AddIrrigationMeasurement(newIrrigationMeasurementEntity);
                    }

                    irrigationEventEntities.Add(newIrrigationEventEntity);
                }

                input.IrrigationData = irrigationEventEntities;

                List<GlobalOutput> globalOutput = Calculations.Calculate(input);

                ProcessCalculationsResponse response = await Save(globalOutput);

                responses.Add(response);
            }

            return responses;
        }

        private async Task<ProcessCalculationsResponse> Save(List<GlobalOutput> output)
        {
            return null;
        }
    }
}
