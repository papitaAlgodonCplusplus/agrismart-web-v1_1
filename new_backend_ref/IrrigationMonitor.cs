using AgriSmart.AgronomicProcess.Models;
using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Services.Responses;
using AgriSmart.AgronomicProcess.Services;
using AgriSmart.AgronomicProcess.Entities;
using TimeZoneConverter;
using System.Numerics;
using System.Diagnostics;
using System.Collections.Generic;

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
        public async Task<bool> SetCropProductionsToIrrigate(IList<CropProductionEntity> cropProductions, string token, CancellationToken ct)
        {

            foreach (CropProductionEntity cropProduction in cropProductions)
            {

                if (ct.IsCancellationRequested)
                    return false;

                switch (cropProduction.IrrigationModeId)
                {
                    case 1:
                        //Manual Irrigation Mode
                        break;
                    case 2:
                        {
                            if (cropProduction.IrrigationPlanId != null)
                            {
                                await SetCropProductionsToIrrigateFromPlan(token, cropProduction);
                            }
                            break;
                        }
                    case 3:
                        {
                            bool succeed =  await SetCropProductionsToIrrigateOnDemand(token, cropProduction);

                            if(!succeed)
                                SetCropProductionsToIrrigateFromPlan(token, cropProduction, true).Wait();
                            break;
                        }
                }
            }

            return true;

        }
        private async Task<bool> SetCropProductionsToIrrigateFromPlan(string token, CropProductionEntity cropProduction, bool start = false)
        {
            IList<CropProductionIrrigationRequest> activeIrrigationRequest = await _agriSmartApiClient.GetAllCropProductionIrrigationRequests(cropProduction.Id, token);
            //if there an active CropProductionIrrigationRequest , do not create another one
            if (activeIrrigationRequest.Count > 0)
                return false;

            IList<CalculationSetting> calculationSettings = await _agriSmartApiClient.GetCalculationSettings(cropProduction.ProductionUnit.Farm.Company.CatalogId, token);
            IList<MeasurementVariable> measurementVariables = await _agriSmartApiClient.GetMeasurementVariables(cropProduction.ProductionUnit.Farm.Company.CatalogId, token);

            IrrigationPlan irrigationPlan = await _agriSmartApiClient.GetIrrigationPlan(cropProduction.IrrigationPlanId, token);

            IList<IrrigationPlanEntry> irrigationPlanEntries = await _agriSmartApiClient.GetIrrigationPlanEntries(cropProduction.IrrigationPlanId, token);

            if (irrigationPlanEntries.Count == 0)
                return false;

            IrrigationPlanEntity irrigationPlanEntity = new IrrigationPlanEntity(irrigationPlan, irrigationPlanEntries);

            int timeZoneId = cropProduction.ProductionUnit.Farm.TimeZoneId;

            Models.TimeZone timeZone = await _agriSmartApiClient.GetTimeZone(timeZoneId, token);

            TimeZoneInfo localTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZone.Name);

            DateTime localTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, localTimeZone);

            var request = IrrigationPlanHelper.GetIrrigationRequest(irrigationPlanEntity, localTime);
            request.DepletionPercentage = cropProduction.DepletionPercentage;
            request.IrrigationModeId = 2;

            bool irrigate = true;

            if (!request.Irrigate && !start)
                return false;
            else
                request.Irrigate = true;

            request.CropProductionId = cropProduction.Id;

            int irrigationTimeSpan = getIrrigationSpan(cropProduction);
            double volumetricHumeditySetPoint = cropProduction.GrowingMedium.ContainerCapacityPercentage - cropProduction.GrowingMedium.TotalAvailableWaterPercentage * (cropProduction.DepletionPercentage / 100.0);


            CalculationSetting MaxVolumetricWaterContentLastReadingDelayMinutesSetting = calculationSettings.Where(x => x.Name == "MaxVolumetricWaterContentLastReadingDelayMinutes").FirstOrDefault();

            string formattedPeriodStartingDate = localTime.AddMinutes(MaxVolumetricWaterContentLastReadingDelayMinutesSetting.Value * -1).ToString("yyyy-MM-dd HH:mm:ss");
            string encodedStartingDateTime = Uri.EscapeDataString(formattedPeriodStartingDate);
            string formattedPeriodEndingDateTime = localTime.ToString("yyyy-MM-dd HH:mm:ss");
            string encodedEndingDateTime = Uri.EscapeDataString(formattedPeriodEndingDateTime);

            CalculationSetting growingMediumVolumetricWaterContentMeasurementVariableIdSetting = calculationSettings.Where(x => x.Name == "GrowingMediumVolumetricWaterContentMeasurementVariableId").FirstOrDefault();

            MeasurementVariable volumetricWaterContentMeasurementVariable = measurementVariables.Where(x => x.Id == Convert.ToInt32(growingMediumVolumetricWaterContentMeasurementVariableIdSetting.Value)).FirstOrDefault();
            IList<MeasurementBase> volumetricHumedities = await _agriSmartApiClient.GetMeasurementsBase(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, volumetricWaterContentMeasurementVariable.Id, token);
            IList<MeasurementBase> validVolumetricHumedities = volumetricHumedities.Where(x => x.RecordValue > 0).OrderBy(x => x.RecordValue).ToList();
            ;

            if (irrigationTimeSpan != 0)
                request.IrrigationTime = irrigationTimeSpan;

            if (irrigate)
            {
                if (validVolumetricHumedities.Count > 0)
                {
                    if (localTime.Subtract(volumetricHumedities[0].RecordDate).Minutes <= MaxVolumetricWaterContentLastReadingDelayMinutesSetting.Value)
                    {
                        double avgHumedity = volumetricHumedities.Average(x => x.RecordValue);

                        if (avgHumedity <= volumetricHumeditySetPoint)
                        {
                            await _agriSmartApiClient.CreateCropProductionIrrigationRequest(request, token);
                            _logger.LogDebug("Method: SetCropProductionsToIrrigateFromPlanMode, Parms | cropProductionId={cropId}, Local Time {localtime}, volumetricHumeditySetPoint {setpoint} , Volumetric Humedity {vh}", cropProduction.Id, localTime, volumetricHumeditySetPoint, avgHumedity);
                            return true;
                        }

                        return false;
                    }
                }
                else
                {
                    await _agriSmartApiClient.CreateCropProductionIrrigationRequest(request, token);
                    return true;
                }
            }




            return true;

        }
        private static int getIrrigationSpan(CropProductionEntity cropProduction)
        {
            try
            {
                double flowRatePerContainer = cropProduction.Dropper.FlowRate * cropProduction.NumberOfDroppersPerContainer;
                double containerVolumen = cropProduction.Container.Volume.Value;
                double totalAvailableWaterVolumen = containerVolumen * (cropProduction.GrowingMedium.TotalAvailableWaterPercentage / 100.0);
                double volumenWaterConsumptionAtIrrigationThreshold = totalAvailableWaterVolumen * (cropProduction.DepletionPercentage / 100);
                double volumenWaterDrainedAtDrainThreshold = volumenWaterConsumptionAtIrrigationThreshold * (cropProduction.DrainThreshold / 100);
                double totalIrrigationVolumen = volumenWaterConsumptionAtIrrigationThreshold + volumenWaterDrainedAtDrainThreshold;
                return Convert.ToInt32(totalIrrigationVolumen / flowRatePerContainer * 60.0);
            }
            catch (Exception)
            {
                return 0;
            }
        }
        private async Task<bool> SetCropProductionsToIrrigateOnDemand(string token, CropProductionEntity cropProduction)
        {
            IList<CropProductionIrrigationRequest> irrigationRequests = await _agriSmartApiClient.GetAllCropProductionIrrigationRequests(cropProduction.Id, token, true);

            IList<CropProductionIrrigationRequest> orderedIrrigationRequests = irrigationRequests.OrderByDescending(x => x.DateCreated).ToList();   

            double cropProductionDepletionPercentage = cropProduction.DepletionPercentage;

            if (orderedIrrigationRequests.Count > 0 && orderedIrrigationRequests[0].Active)
                return false;

            IList<CalculationSetting> calculationSettings = await _agriSmartApiClient.GetCalculationSettings(cropProduction.ProductionUnit.Farm.Company.CatalogId, token);
            CalculationSetting growingMediumVolumetricWaterContentMeasurementVariableIdSetting = calculationSettings.Where(x => x.Name == "GrowingMediumVolumetricWaterContentMeasurementVariableId").FirstOrDefault();
            CalculationSetting drainVolumenMeasurementVariableIdSetting = calculationSettings.Where(x => x.Name == "DrainVolume").FirstOrDefault();
            CalculationSetting MaxVolumetricWaterContentLastReadingDelayMinutesSetting = calculationSettings.Where(x => x.Name == "MaxVolumetricWaterContentLastReadingDelayMinutes").FirstOrDefault();
            CalculationSetting irrigationVolumeMeasurementVariableIdSetting = calculationSettings.Where(x => x.Name == "IrrigationVolume").FirstOrDefault();

            IList<MeasurementVariable> measurementVariables = await _agriSmartApiClient.GetMeasurementVariables(cropProduction.ProductionUnit.Farm.Company.CatalogId, token);

            double volumetricHumeditySetPoint = cropProduction.GrowingMedium.ContainerCapacityPercentage - cropProduction.GrowingMedium.TotalAvailableWaterPercentage * (cropProduction.DepletionPercentage / 100.0);

            int timeZoneId = cropProduction.ProductionUnit.Farm.TimeZoneId;

            Models.TimeZone timeZone = await _agriSmartApiClient.GetTimeZone(timeZoneId, token);

            TimeZoneInfo localTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZone.Name);

            DateTime userTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, localTimeZone);

            string formattedPeriodStartingDate = userTime.Date.ToString("yyyy-MM-dd HH:mm:ss");
            string encodedStartingDateTime = Uri.EscapeDataString(formattedPeriodStartingDate);
            string formattedPeriodEndingDateTime = userTime.ToString("yyyy-MM-dd HH:mm:ss");
            string encodedEndingDateTime = Uri.EscapeDataString(formattedPeriodEndingDateTime);

            IList<IrrigationEvent> irrigationEvents = await _agriSmartApiClient.GetIrrigationEvents(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, true, token);
            irrigationEvents = irrigationEvents.OrderByDescending(x => x.DateTimeEnd).ToList();

            if (irrigationEvents.Count == 0)
                return false;

            MeasurementVariable volumetricWaterContentMeasurementVariable = measurementVariables.Where(x => x.Id == Convert.ToInt32(growingMediumVolumetricWaterContentMeasurementVariableIdSetting.Value)).FirstOrDefault();

            DateTime startingDateTimeVolumetricHumedity = userTime.AddMinutes(MaxVolumetricWaterContentLastReadingDelayMinutesSetting.Value * -1);
            string formattedStartingDateTimeVolumetricHumedity = startingDateTimeVolumetricHumedity.ToString("yyyy-MM-dd HH:mm:ss");
            string encodedStartingDateTimeVolumetricHumedity = Uri.EscapeDataString(formattedStartingDateTimeVolumetricHumedity);

            IList<MeasurementBase> volumetricHumedities = await _agriSmartApiClient.GetMeasurementsBase(encodedStartingDateTimeVolumetricHumedity, encodedEndingDateTime, cropProduction.Id, volumetricWaterContentMeasurementVariable.Id, token);
            IList<MeasurementBase> validVolumetricHumedities = volumetricHumedities.Where(x => x.RecordValue > 0).OrderByDescending(x => x.RecordDate).ToList();
          
            if (validVolumetricHumedities.Count == 0)
                return false;

            double measuredVolumetricHumedity = volumetricHumedities.Average(x => x.RecordValue);

            if (measuredVolumetricHumedity < volumetricHumeditySetPoint)
            {
                double totalIrrigationVolumen = 0;
                double flowRatePerContainer = 0;
                double previousDrainPercentage = 0;
                double drainDifferencePercentage = 0;
                double containerVolumen = cropProduction.Container.Volume.Value;
                double totalAvailableWaterVolumen = 0;
                double totalDepletionPercentaje = 0;
                double availableDepletionPercentage = 0;
                double volumenWaterConsumptionAtIrrigation = 0;
                double volumenWaterDrainedAtDrainThreshold = 0;
                double irrigationAdjustment = 0;
                double previuosIrrigationVolume = 0;

                IrrigationMeasurement previousDrainVolumen = irrigationEvents[0].IrrigationEventMeasurements.Where(x => x.MeasurementVariableId == Convert.ToInt32(drainVolumenMeasurementVariableIdSetting.Value)).FirstOrDefault();
                IrrigationMeasurement previousIrrigationVolumen = irrigationEvents[0].IrrigationEventMeasurements.Where(x => x.MeasurementVariableId == Convert.ToInt32(irrigationVolumeMeasurementVariableIdSetting.Value)).FirstOrDefault();

                flowRatePerContainer = cropProduction.Dropper.FlowRate * cropProduction.NumberOfDroppersPerContainer;

                if (cropProductionDepletionPercentage != orderedIrrigationRequests[0].DepletionPercentage)
                {
                    if (previousIrrigationVolumen.RecordValue == 0)
                        return false;

                    cropProduction.GrowingMedium.FiveKpaHumidity = 37.16;//change endpoint and create column

                    totalAvailableWaterVolumen = containerVolumen * (cropProduction.GrowingMedium.TotalAvailableWaterPercentage / 100.0);

                    totalDepletionPercentaje = cropProduction.GrowingMedium.ContainerCapacityPercentage - measuredVolumetricHumedity;

                    availableDepletionPercentage = (totalDepletionPercentaje / cropProduction.GrowingMedium.TotalAvailableWaterPercentage) * 100;

                    volumenWaterConsumptionAtIrrigation = totalAvailableWaterVolumen * availableDepletionPercentage / 100;

                    volumenWaterDrainedAtDrainThreshold = volumenWaterConsumptionAtIrrigation * (cropProduction.DrainThreshold / 100);

                    totalIrrigationVolumen = volumenWaterConsumptionAtIrrigation + volumenWaterDrainedAtDrainThreshold;

                }
                else
                {
                    previuosIrrigationVolume = irrigationEvents[0].IrrigationEventMeasurements.Where(x => x.MeasurementVariableId == Convert.ToInt32(irrigationVolumeMeasurementVariableIdSetting.Value)).FirstOrDefault().RecordValue;
                    previousDrainPercentage = (previousDrainVolumen.RecordValue / previousIrrigationVolumen.RecordValue) * 100;
                    drainDifferencePercentage = cropProduction.DrainThreshold - previousDrainPercentage;
                    irrigationAdjustment = previuosIrrigationVolume * (drainDifferencePercentage / 100);
                    totalIrrigationVolumen = previuosIrrigationVolume + irrigationAdjustment;
                }

                int irrigationTimeSpan = Convert.ToInt32(Math.Round((totalIrrigationVolumen / flowRatePerContainer) * 60.0));

                CropProductionIrrigationRequest irrigationRequest = new CropProductionIrrigationRequest();

                irrigationRequest.Irrigate = true;
                irrigationRequest.IrrigationTime = irrigationTimeSpan;
                irrigationRequest.CropProductionId = cropProduction.Id;
                irrigationRequest.DepletionPercentage = cropProduction.DepletionPercentage;
                irrigationRequest.IrrigationModeId = 3;

                _logger.LogDebug("Method: SetCropProductionsToIrrigateFromPlanMode, Parms | " +
                    "cropProductionId={cropId}, " +
                    "Local Time {localtime}, " +
                    "volumetricHumeditySetPoint {setpoint}, " +
                    "Volumetric Humedity {vh} " +
                    "drainDifferencePercentage {df} " +
                    "containerVolumen {cv} " +
                    "easelyAvailableWaterVolumen {eaa} " +
                    "totalAvailableWaterVolumen {twv}," +
                    "volumenWaterConsumptionAtIrrigationThreshold {vcit}," +
                    "volumenWaterDrainedAtDrainThreshold {vwddt}," +
                    "irrigationAdjustment {ia}," +
                    "totalIrrigationVolumen {tiv}," +
                    "flowRatePerContainer {frc}," +
                    "irrigationTimeSpan {its},"
                    , cropProduction.Id,
                    userTime,
                    volumetricHumeditySetPoint,
                    measuredVolumetricHumedity,
                    drainDifferencePercentage,
                    containerVolumen,
                    totalAvailableWaterVolumen,
                    volumenWaterConsumptionAtIrrigation,
                    irrigationAdjustment,
                    totalIrrigationVolumen,
                    flowRatePerContainer,
                    irrigationTimeSpan
                    );

                await _agriSmartApiClient.CreateCropProductionIrrigationRequest(irrigationRequest, token);

                return true;
            }

            return true;
        }
        //public async Task<List<ProcessCalculationsResponse>> Calculate(IList<CropProduction> cropProductions, string token, CancellationToken ct)
        //{
        //    List<ProcessCalculationsResponse> responses = new List<ProcessCalculationsResponse>();

        //    foreach (CropProduction cropProduction in cropProductions)
        //    {
        //        if (ct.IsCancellationRequested)
        //            return null;

        //        CalculationInput input = new CalculationInput();

        //        CropProductionEntity cropProductionEntity = new CropProductionEntity(cropProduction);
        //        Crop crop = _agriSmartApiClient.GetCrop(cropProduction.CropId, token ).Result;
        //        cropProductionEntity.Crop = new CropEntity(crop);
        //        cropProductionEntity.ProductionUnit = new ProductionUnitEntity(cropProduction.ProductionUnit);
        //        Container container = _agriSmartApiClient.GetContainer(cropProduction.ContainerId, token).Result;
        //        cropProductionEntity.Container = new ContainerEntity(container);
        //        Dropper dropper = _agriSmartApiClient.GetDropper(cropProduction.DropperId, token).Result;
        //        cropProductionEntity.Dropper = new DropperEntity(dropper);
        //        GrowingMedium growingMedium = _agriSmartApiClient.GetGrowingMedium(cropProduction.GrowingMediumId, token).Result;
        //        cropProductionEntity.GrowingMedium = new GrowingMediumEntity(growingMedium);

        //        //TimeZoneInfo timeZoneInfo = TZConvert.GetTimeZoneInfo(cropProduction.ProductionUnit.Farm.TimeZoneName);
        //        //DateTime localTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneInfo);

        //        string formattedMinDate = DateTime.MinValue.ToString("yyyy-MM-dd HH:mm:ss");
        //        string formattedNowDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

        //        MeasurementKPI last = _agriSmartApiClient.GetLastMeasurementKPI(formattedMinDate, formattedNowDate, cropProduction.Id, token).Result;
        //        DateTime lastKPIDateTime = last.RecordDate.AddSeconds(1);
        //        input.StartingDate = lastKPIDateTime;

        //        string formattedPeriodStartingDate = lastKPIDateTime.ToString("yyyy-MM-dd HH:mm:ss");
        //        string encodedStartingDateTime = Uri.EscapeDataString(formattedPeriodStartingDate);

        //        DateTime EndingDateTime = DateTime.Parse("2024-06-30 23:59:59");

        //        //there are two options, using .Net TZConvert library with farm timeZoneId or paid Google Google Time Zone API 
        //        //string timeZoneId = "Central Standard Time"; // this should be farm attribute
        //        //DateTime utcTime = DateTime.UtcNow;

        //        //TimeZoneInfo timeZoneInfo = TZConvert.GetTimeZoneInfo(timeZoneId);
        //        //DateTime localTime = TimeZoneInfo.ConvertTimeFromUtc(utcTime, timeZoneInfo);
        //        //DateTime EndingDateTime = localTime;

        //        input.EndingDate = EndingDateTime;
        //        string formattedPeriodEndingDate = input.EndingDate.ToString("yyyy-MM-dd HH:mm:ss");
        //        string formattedCurrentDateTime = input.EndingDate.ToString("yyyy-MM-dd HH");
        //        string encodedEndingDateTime = Uri.EscapeDataString(formattedPeriodEndingDate);
        //        string encodedCurrentDateTime = Uri.EscapeDataString(formattedCurrentDateTime);

        //        IList<MeasurementKPI> currentHourKPIs = await _agriSmartApiClient.GetMeasurementKPIs(encodedCurrentDateTime, encodedCurrentDateTime, cropProduction.Id, token);
        //        if (currentHourKPIs != null)
        //        {
        //            input.CurrentDateTimeMeasurementKPIs = new List<MeasurementKPI>();
        //            input.CurrentDateTimeMeasurementKPIs.AddRange(currentHourKPIs);
        //        }

        //        input.CropProduction = cropProductionEntity;

        //        IList<MeasurementVariable> measurementVariables = await _agriSmartApiClient.GetMeasurementVariables(cropProduction.ProductionUnit.Farm.Company.CatalogId, token);
        //        input.MeasurementVariables = new List<MeasurementVariable>();
        //        input.MeasurementVariables.AddRange(measurementVariables);

        //        List<Measurement> measurements = new List<Measurement>();
        //        MeasurementVariable measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 5).FirstOrDefault();
        //        IList<Measurement> tempData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
        //        measurements.AddRange(tempData);

        //        measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 6).FirstOrDefault();
        //        IList<Measurement> humData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
        //        measurements.AddRange(humData);

        //        measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 7).FirstOrDefault();
        //        IList<Measurement> parData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
        //        measurements.AddRange(parData);

        //        measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 4).FirstOrDefault();
        //        IList<Measurement> radData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
        //        measurements.AddRange(radData);

        //        input.ClimateData = measurements;

        //        List<Measurement> growingMediumMeasurements = new List<Measurement>();
        //        measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 1).FirstOrDefault();
        //        IList<Measurement> growingMediumData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, measurementVariable.Id, token);
        //        growingMediumMeasurements.AddRange(growingMediumData.OrderByDescending(x => x.RecordDate).ToList());

        //        input.GrowingMediumData = growingMediumMeasurements;

        //        IList<IrrigationMeasurement> irrigationMeasurements = await _agriSmartApiClient.GetIrrigationMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, token);

        //        List<IrrigationEventEntity> irrigationEventEntities = new List<IrrigationEventEntity>();
        //        IList<IrrigationEvent> irrigationEvents = await _agriSmartApiClient.GetIrrigationEvents(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, token);

        //        foreach (IrrigationEvent irrigationEvent in irrigationEvents)
        //        {
        //            IrrigationEventEntity newIrrigationEventEntity = new IrrigationEventEntity(irrigationEvent);

        //            //foreach (IrrigationMeasurement irrigationMeasurement in irrigationMeasurements.Where(x => x.EventId == irrigationEvent.Id).ToList())
        //            //{
        //            //    IrrigationMeasurementEntity newIrrigationMeasurementEntity = new IrrigationMeasurementEntity(irrigationMeasurement);
        //            //    newIrrigationEventEntity.AddIrrigationMeasurement(newIrrigationMeasurementEntity);
        //            //}

        //            irrigationEventEntities.Add(newIrrigationEventEntity);
        //        }

        //        input.IrrigationData = irrigationEventEntities;

        //        List<GlobalOutput> globalOutput = Calculations.Calculate(input);

        //        ProcessCalculationsResponse response = await Save(globalOutput);

        //        responses.Add(response);
        //    }

        //    return responses;
        //}
        //private async Task<ProcessCalculationsResponse> Save(List<GlobalOutput> output)
        //{
        //    return null;
        //}
    }
}
