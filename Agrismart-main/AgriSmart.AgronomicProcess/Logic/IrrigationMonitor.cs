using AgriSmart.AgronomicProcess.Models;
using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Services.Responses;
using AgriSmart.AgronomicProcess.Services;
using AgriSmart.AgronomicProcess.Entities;
using TimeZoneConverter;

namespace AgriSmart.AgronomicProcess.Logic
{
    public class IrrigationMonitor
    {
        private MeasurementKPIEntity lastestMeasurermentKPI;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly IAgriSmartApiClient _agriSmartApiClient;
        private readonly ILogger _logger;
        private string _token = string.Empty;

        public IrrigationMonitor(ILogger logger, AgrismartApiConfiguration agrismartApiConfiguration, IAgriSmartApiClient agriSmartApiClient)
        {
            _logger = logger;
            _agrismartApiConfiguration = agrismartApiConfiguration;
            _agriSmartApiClient = agriSmartApiClient;
        }

        public async Task<List<IrrigationRequest>> SetCropProductionsToIrrigate(IList<CropProductionEntity> cropProductions, string token, CancellationToken ct)
        {
            List<IrrigationRequest> output = new List<IrrigationRequest>();

            foreach (CropProductionEntity cropProduction in cropProductions)
            {
                if (ct.IsCancellationRequested)
                    return null;

                IList<MeasurementVariable> measurementVariables = await _agriSmartApiClient.GetMeasurementVariables(cropProduction.ProductionUnit.Farm.Company.CatalogId, token);

                double volumetricHumeditySetPoint = cropProduction.GrowingMedium.ContainerCapacityPercentage - cropProduction.GrowingMedium.TotalAvailableWaterPercentage * (cropProduction.DepletionPercentage / 100.0);

                string formattedPeriodStartingDate = DateTime.UtcNow.Date.ToString("yyyy-MM-dd HH:mm:ss");
                string encodedStartingDateTime = Uri.EscapeDataString(formattedPeriodStartingDate);
                string formattedPeriodEndingDateTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
                string encodedEndingDateTime = Uri.EscapeDataString(formattedPeriodEndingDateTime);

                IList<IrrigationEvent> irrigationEvents = await _agriSmartApiClient.GetIrrigationEvents(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, token);
                irrigationEvents.OrderByDescending(x => x.DateTimeEnd);

                IList<IrrigationMeasurement> irrigationMeasurements = await _agriSmartApiClient.GetIrrigationMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, token);
                IrrigationMeasurement previousDrainVolumen = irrigationMeasurements.Where(x => x.MeasurementVariableId == 20 && x.EventId == irrigationEvents[0].Id).FirstOrDefault();
                IrrigationMeasurement previousIrrigationVolumen = irrigationMeasurements.Where(x => x.MeasurementVariableId == 19 && x.EventId == irrigationEvents[0].Id).FirstOrDefault();

                double previousDrainPercentage = previousDrainVolumen.RecordValue / previousIrrigationVolumen.RecordValue * 100;
                MeasurementVariable measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 1).FirstOrDefault();

                IList<MeasurementBase> volumetricHumedities = await _agriSmartApiClient.GetMeasurementsBase(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
                volumetricHumedities.OrderByDescending(x => x.RecordDate);

                double measuredVolumetricHumedity = volumetricHumedities[0].RecordValue;

                if (measuredVolumetricHumedity < volumetricHumeditySetPoint)
                {
                    IrrigationRequest irrigationRequest = new IrrigationRequest();

                    double drainDifference = cropProduction.DrainThreshold - previousDrainPercentage;

                    double containerVolumen = cropProduction.Container.Volume.Value;

                    double easelyAvailableWaterVolumen = containerVolumen * (cropProduction.GrowingMedium.EaselyAvailableWaterPercentage / 100.0);

                    double reserveWaterVolumen = containerVolumen * (cropProduction.GrowingMedium.ReserveWaterPercentage / 100.0);

                    double totalAvailableWaterVolumen = containerVolumen * (cropProduction.GrowingMedium.TotalAvailableWaterPercentage / 100.0);

                    double volumenWaterConsumptionAtIrrigationThreshold = totalAvailableWaterVolumen * (cropProduction.DepletionPercentage / 100);

                    double volumenWaterDrainedAtDrainThreshold = totalAvailableWaterVolumen * (cropProduction.DrainThreshold / 100);

                    double totalIrrigationVolumen = volumenWaterConsumptionAtIrrigationThreshold + volumenWaterDrainedAtDrainThreshold + volumenWaterConsumptionAtIrrigationThreshold * drainDifference / 100;

                    double flowRatePerContainer = cropProduction.Dropper.FlowRate * cropProduction.NumberOfDroppersPerContainer;

                    int irrigationTimeSpan = Convert.ToInt32(totalIrrigationVolumen / flowRatePerContainer * 60.0);

                    irrigationRequest.Irrigate = true;
                    irrigationRequest.IrrigationTime = irrigationTimeSpan;
                    output.Add(irrigationRequest);

                }
            }

            return output;

        }



        public async Task<List<ProcessCalculationsResponse>> Calculate(IList<CropProduction> cropProductions, string token, CancellationToken ct)
        {
            List<ProcessCalculationsResponse> responses = new List<ProcessCalculationsResponse>();

            foreach (CropProduction cropProduction in cropProductions)
            {
                if (ct.IsCancellationRequested)
                    return null;

                CalculationInput input = new CalculationInput();

                CropProductionEntity cropProductionEntity = new CropProductionEntity(cropProduction);
                Crop crop = _agriSmartApiClient.GetCrop(cropProduction.CropId, token ).Result;
                cropProductionEntity.Crop = new CropEntity(crop);
                cropProductionEntity.ProductionUnit = new ProductionUnitEntity(cropProduction.ProductionUnit);
                Container container = _agriSmartApiClient.GetContainer(cropProduction.ContainerId, token).Result;
                cropProductionEntity.Container = new ContainerEntity(container);
                Dropper dropper = _agriSmartApiClient.GetDropper(cropProduction.DropperId, token).Result;
                cropProductionEntity.Dropper = new DropperEntity(dropper);
                GrowingMedium growingMedium = _agriSmartApiClient.GetGrowingMedium(cropProduction.GrowingMediumId, token).Result;
                cropProductionEntity.GrowingMedium = new GrowingMediumEntity(growingMedium);

                //TimeZoneInfo timeZoneInfo = TZConvert.GetTimeZoneInfo(cropProduction.ProductionUnit.Farm.TimeZoneName);
                //DateTime localTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneInfo);

                string formattedMinDate = DateTime.MinValue.ToString("yyyy-MM-dd HH:mm:ss");
                string formattedNowDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

                MeasurementKPI last = _agriSmartApiClient.GetLastMeasurementKPI(formattedMinDate, formattedNowDate, cropProduction.Id, token).Result;
                DateTime lastKPIDateTime = last.RecordDate.AddSeconds(1);
                input.StartingDate = lastKPIDateTime;

                string formattedPeriodStartingDate = lastKPIDateTime.ToString("yyyy-MM-dd HH:mm:ss");
                string encodedStartingDateTime = Uri.EscapeDataString(formattedPeriodStartingDate);

                DateTime EndingDateTime = DateTime.Parse("2024-06-30 23:59:59");

                //there are two options, using .Net TZConvert library with farm timeZoneId or paid Google Google Time Zone API 
                //string timeZoneId = "Central Standard Time"; // this should be farm attribute
                //DateTime utcTime = DateTime.UtcNow;

                //TimeZoneInfo timeZoneInfo = TZConvert.GetTimeZoneInfo(timeZoneId);
                //DateTime localTime = TimeZoneInfo.ConvertTimeFromUtc(utcTime, timeZoneInfo);
                //DateTime EndingDateTime = localTime;

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

                input.CropProduction = cropProductionEntity;

                IList<MeasurementVariable> measurementVariables = await _agriSmartApiClient.GetMeasurementVariables(cropProduction.ProductionUnit.Farm.Company.CatalogId, token);
                input.MeasurementVariables = new List<MeasurementVariable>();
                input.MeasurementVariables.AddRange(measurementVariables);

                List<Measurement> measurements = new List<Measurement>();
                MeasurementVariable measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 5).FirstOrDefault();
                IList<Measurement> tempData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
                measurements.AddRange(tempData);

                measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 6).FirstOrDefault();
                IList<Measurement> humData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
                measurements.AddRange(humData);

                measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 7).FirstOrDefault();
                IList<Measurement> parData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
                measurements.AddRange(parData);

                measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 4).FirstOrDefault();
                IList<Measurement> radData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
                measurements.AddRange(radData);

                input.ClimateData = measurements;

                List<Measurement> growingMediumMeasurements = new List<Measurement>();
                measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 1).FirstOrDefault();
                IList<Measurement> growingMediumData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
                growingMediumMeasurements.AddRange(growingMediumData.OrderByDescending(x => x.RecordDate).ToList());

                input.GrowingMediumData = growingMediumMeasurements;

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
