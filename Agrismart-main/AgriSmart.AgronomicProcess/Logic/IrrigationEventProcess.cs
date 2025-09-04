using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Entities;
using AgriSmart.AgronomicProcess.Models;
using AgriSmart.AgronomicProcess.Services;
using AgriSmart.AgronomicProcess.Services.Responses;
using System.Collections.Generic;
using TimeZone = AgriSmart.AgronomicProcess.Models.TimeZone;

namespace AgriSmart.AgronomicProcess.Logic
{
    public class IrrigationEventProcess
    {
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly IAgriSmartApiClient _agriSmartApiClient;
        private readonly ILogger _logger;
        private string _token = string.Empty;

        public IrrigationEventProcess(string token, ILogger logger, AgrismartApiConfiguration agrismartApiConfiguration, IAgriSmartApiClient agriSmartApiClient)
        {
            _token = token;
            _logger = logger;
            _agrismartApiConfiguration = agrismartApiConfiguration;
            _agriSmartApiClient = agriSmartApiClient;   
        }

        public async Task<bool> Process(CropProductionEntity cropProduction, IList<CalculationSetting> calculationSettings, string token)
        {
            IList<IrrigationEvent> irrigationEvents = GetIrrigationEvents(cropProduction, calculationSettings, token).Result;
            bool saveSuccess = await SaveIrrigationEvents(irrigationEvents, token);
            return true;
        }

        private async Task<bool> SaveIrrigationEvents(IList<IrrigationEvent> irrigationEvents, string token)
        {
            foreach (IrrigationEvent irrigationEvent in irrigationEvents)
            {
                //CreateIrrigationEventResponse reponse = await _agriSmartApiClient.CreateIrrigationEvent(irrigationEvent, token);
            }

            return true;
        }
        private static IList<IrrigationEvent> GetCropProductionIrrigationEvents(
            IList<CalculationSetting> calculationSettings,
            IrrigationEvent inProgressIrrigationEvent,
            IList<MeasurementBase> readings)
        {
            if (readings == null || readings.Count < 2)
                return null;

            CalculationSetting initialPressureSetting = calculationSettings.Where(x => x.Name == "InitialPressureMeasurementVariableId").FirstOrDefault();
            CalculationSetting maximumPressureSetting = calculationSettings.Where(x => x.Name == "MaximumPressureMeasurementVariableId").FirstOrDefault();
            CalculationSetting deltaPressure = calculationSettings.Where(x => x.Name == "PressureDeltaThreshold").FirstOrDefault();
            
            var result = new List<IrrigationEvent>();
            bool isPumpOn = false;
            double initialPressure = 0;
            double maxPressure = 0;

            IrrigationEvent currentEvent = null;

            if (! (inProgressIrrigationEvent.DateTimeStart == DateTime.MinValue &&  inProgressIrrigationEvent.DateTimeEnd == DateTime.MinValue))
            {
                isPumpOn = true;
                currentEvent = inProgressIrrigationEvent;
                IrrigationMeasurement maximumPressureMeasurement = inProgressIrrigationEvent.Measurements.Where(x => x.MeasurementVariableId == Convert.ToInt32(maximumPressureSetting.Value)).FirstOrDefault();
                if (maximumPressureMeasurement != null)
                    initialPressure = maximumPressureMeasurement.RecordValue;
            }
            else
            {
                isPumpOn = false;
            }

            IList<MeasurementBase> orderedReading = readings.OrderBy(x => x.RecordDate).ToList();

            for (int i = 1; i < orderedReading.Count; i++)
            {
                double previous = orderedReading[i - 1].RecordValue;
                double current = orderedReading[i].RecordValue;
                double delta = current - previous;

                if (!isPumpOn && delta >= deltaPressure.Value)
                {
                    // Pump turned on
                    if (currentEvent == null)
                        currentEvent = new IrrigationEvent();

                    currentEvent.DateTimeStart = orderedReading[i].RecordDate;
                    IrrigationMeasurement initialPressureMeasurement = new IrrigationMeasurement
                    {
                        MeasurementVariableId = Convert.ToInt32(initialPressureSetting.Value),
                        RecordValue = current
                    };
                    currentEvent.Measurements.Add(initialPressureMeasurement);
                    isPumpOn = true;
                    result.Add(currentEvent);
                }
                else if (isPumpOn && delta <= -deltaPressure.Value && currentEvent != null)
                {
                    currentEvent.DateTimeEnd = orderedReading[i].RecordDate;
                    isPumpOn = false;

                    IrrigationMeasurement MaximumPressureMeasurement = new IrrigationMeasurement
                    {
                        MeasurementVariableId = Convert.ToInt32(maximumPressureSetting.Value),
                        RecordValue = maxPressure
                    };

                    currentEvent.Measurements.Add(MaximumPressureMeasurement);

                    currentEvent = null;

                    maxPressure = 0;
                    current = 0;
                }

                if (current > maxPressure)
                    maxPressure = current;
            }

            return result;
        }

        private static IList<IrrigationEvent> GetIrrigationEventsVolumes(
            IList<IrrigationEvent> irrigationEvents, 
            IList<MeasurementBase> waterInputs, 
            IList<MeasurementBase> waterDrains,
            IList<CalculationSetting> calculationSettings,
            DateTime localTime)
        {
            CalculationSetting irrigationVolumenMeasurementVariableId = calculationSettings.Where(x => x.Name == "IrrigationVolume").FirstOrDefault();
            CalculationSetting drainVolumenMeasurementVariableId = calculationSettings.Where(x => x.Name == "DrainVolume").FirstOrDefault();

            IList<IrrigationEvent> orderedIrrigationEvents = irrigationEvents.OrderBy(x=> x.DateTimeStart).ToList();

            for (int i = 0; i < orderedIrrigationEvents.Count; i++)
            {
                DateTime limitDateTime = orderedIrrigationEvents[i].DateTimeEnd;

                if (orderedIrrigationEvents[i].DateTimeEnd == DateTime.MinValue)
                {
                    limitDateTime = localTime;
                }

                double irrigationVolume = waterInputs.Where(x=> x.RecordDate >= orderedIrrigationEvents[i].DateTimeStart && x.RecordDate <= limitDateTime).Sum(x=>x.RecordValue);
                
                IrrigationMeasurement totalIrrigationVolumeMeasurement = new IrrigationMeasurement
                {
                    MeasurementVariableId = Convert.ToInt32(irrigationVolumenMeasurementVariableId.Value),
                    RecordValue = irrigationVolume
                };

                orderedIrrigationEvents[i].Measurements.Add(totalIrrigationVolumeMeasurement);

                DateTime drainLimitDateTime = localTime;

                if ((i + 1) < orderedIrrigationEvents.Count)
                {
                    drainLimitDateTime = orderedIrrigationEvents[1 + 1].DateTimeStart.AddMinutes(-1);
                }

                double drainVolume = waterDrains.Where(x => x.RecordDate >= orderedIrrigationEvents[i].DateTimeStart && x.RecordDate <= drainLimitDateTime).Sum(x => x.RecordValue);

                IrrigationMeasurement totalDrainVolumeMeasurement = new IrrigationMeasurement
                {
                    MeasurementVariableId = Convert.ToInt32(drainVolumenMeasurementVariableId.Value),
                    RecordValue = drainVolume
                };

                orderedIrrigationEvents[i].Measurements.Add(totalDrainVolumeMeasurement);
            }

            return orderedIrrigationEvents;
        }

        public async Task<IList<IrrigationEvent>> GetIrrigationEvents(CropProductionEntity cropProduction, IList<CalculationSetting> calculationSettings, string token)
        {
            try
            {
                int timeZoneId = cropProduction.ProductionUnit.Farm.TimeZoneId;

                TimeZone timeZone = await _agriSmartApiClient.GetTimeZone(timeZoneId, token);

                TimeZoneInfo localTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZone.Name);

                DateTime localTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, localTimeZone);

                string formattedStartingDate = cropProduction.StartDate.ToString("yyyy-MM-dd HH:mm:ss");
                string formattedNowDate = localTime.ToString("yyyy-MM-dd HH:mm:ss");

                IrrigationEvent lastIrrigationEvent = null;

                IList<IrrigationEvent> irrigationEvents = await _agriSmartApiClient.GetIrrigationEvents(formattedStartingDate, formattedNowDate, cropProduction.Id, token);

                DateTime lastIrrigationEventDate = cropProduction.StartDate;

                IrrigationEvent lastIncompleteEvent = new IrrigationEvent()
                {
                    CropProductionId = cropProduction.Id,
                    DateTimeStart = DateTime.MinValue,
                    DateTimeEnd = DateTime.MinValue,
                    RecordDateTime = DateTime.MinValue,
                    Id = -1
                };

                if (irrigationEvents.Count > 0)
                {
                    irrigationEvents.OrderByDescending(x => x.DateTimeEnd);
                    lastIrrigationEvent = irrigationEvents[0];
                    lastIrrigationEventDate = irrigationEvents[0].DateTimeEnd;
                    if (lastIrrigationEvent.DateTimeEnd == DateTime.MinValue)
                        lastIncompleteEvent = irrigationEvents[0];
                }

                CalculationSetting pipelinePressureMeasurementVariableId = calculationSettings.Where(x => x.Name == "PipelinePressureMeasurementVariableId").FirstOrDefault();
                IList<MeasurementBase> pipelinePressures = await _agriSmartApiClient.GetMeasurementsBase(formattedStartingDate, formattedNowDate, cropProduction.Id, Convert.ToInt32(pipelinePressureMeasurementVariableId.Value), token);

                IList<IrrigationEvent> cropProductionIrrigationEvents = GetCropProductionIrrigationEvents(calculationSettings, lastIncompleteEvent, pipelinePressures);

                CalculationSetting waterInputVolumeMeasurementVariableId = calculationSettings.Where(x => x.Name == "IrrigationInputVolumeMeasurementVariableId").FirstOrDefault();
                IList<MeasurementBase> waterInputs = await _agriSmartApiClient.GetMeasurementsBase(formattedStartingDate, formattedNowDate, cropProduction.Id, Convert.ToInt32(waterInputVolumeMeasurementVariableId.Value), token);

                CalculationSetting waterDrainVolumeMeasurementVariableId = calculationSettings.Where(x => x.Name == "IrrigationDrainVolumeMeasurementVariableId").FirstOrDefault();
                IList<MeasurementBase> waterDrains = await _agriSmartApiClient.GetMeasurementsBase(formattedStartingDate, formattedNowDate, cropProduction.Id, Convert.ToInt32(waterDrainVolumeMeasurementVariableId.Value), token);

                IList<IrrigationEvent> IrrigationEventsWithVolumes = GetIrrigationEventsVolumes(cropProductionIrrigationEvents, waterInputs, waterDrains, calculationSettings, localTime);

                return IrrigationEventsWithVolumes;

            }
            catch (Exception)
            {
                return null;
            }

        }
    }
}
