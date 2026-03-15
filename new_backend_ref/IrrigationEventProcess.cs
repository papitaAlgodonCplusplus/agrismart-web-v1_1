using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Entities;
using AgriSmart.AgronomicProcess.Models;
using AgriSmart.AgronomicProcess.Responses;
using AgriSmart.AgronomicProcess.Services;
using AgriSmart.AgronomicProcess.Services.Responses;
using System.Collections.Generic;
using System.Globalization;
using TimeZone = AgriSmart.AgronomicProcess.Models.TimeZone;

namespace AgriSmart.AgronomicProcess.Logic
{
    public class IrrigationEventProcess
    {
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly IAgriSmartApiClient _agriSmartApiClient;
        private readonly ILogger _logger;
        private string _token = string.Empty;

        public IrrigationEventProcess(ILogger logger, AgrismartApiConfiguration agrismartApiConfiguration, IAgriSmartApiClient agriSmartApiClient, string token)
        {
            _token = token;
            _logger = logger;
            _agrismartApiConfiguration = agrismartApiConfiguration;
            _agriSmartApiClient = agriSmartApiClient;   
        }

        public async Task<ProcessResponse> Process(CropProductionEntity cropProduction, string token)
        {
            try
            {
                int timeZoneId = cropProduction.ProductionUnit.Farm.TimeZoneId;

                TimeZone timeZone = await _agriSmartApiClient.GetTimeZone(timeZoneId, _token);

                TimeZoneInfo localTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZone.Name);

                DateTime userTime = TimeZoneInfo.ConvertTime(DateTime.UtcNow, localTimeZone);

                IList<CalculationSetting> calculationSettings = await _agriSmartApiClient.GetCalculationSettings(cropProduction.ProductionUnit.Farm.Company.CatalogId, _token);

                string formattedDateTimeSinceLastIrrigation = cropProduction.StartDate.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);
                string formattedNowDate = userTime.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);

                IList<IrrigationEvent> irrigationEvents = await _agriSmartApiClient.GetIrrigationEvents(formattedDateTimeSinceLastIrrigation, formattedNowDate, cropProduction.Id, true, token);

                DateTime dateTimeSinceLastIrrigation = cropProduction.StartDate;
                DateTime dateTimeSinceLastIrrigationStart = cropProduction.StartDate;

                IrrigationEvent lastIrrigationEvent = null;

                if (irrigationEvents.Count > 0)
                {
                    var orderedList = irrigationEvents.OrderByDescending(x => x.DateTimeStart);
                    lastIrrigationEvent = orderedList.First();

                    dateTimeSinceLastIrrigation = lastIrrigationEvent.DateTimeEnd.AddSeconds(1);
                    dateTimeSinceLastIrrigationStart = lastIrrigationEvent.DateTimeStart.AddSeconds(1);
                }

                formattedDateTimeSinceLastIrrigation = dateTimeSinceLastIrrigation.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);
                string formattedDateTimeSinceLastIrrigationStart = dateTimeSinceLastIrrigationStart.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);


                CalculationSetting pipelinePressureMeasurementVariableId = calculationSettings.Where(x => x.Name == "PipelinePressureMeasurementVariableId").FirstOrDefault();
                IList<MeasurementBase> pipelinePressures = await _agriSmartApiClient.GetMeasurementsBase(formattedDateTimeSinceLastIrrigation, formattedNowDate, cropProduction.Id, Convert.ToInt32(pipelinePressureMeasurementVariableId.Value), token) ?? new List<MeasurementBase>();

                IList<IrrigationEvent> newIrrigationEvents = GetCropProductionIrrigationEventsByMinPressure(cropProduction, calculationSettings, pipelinePressures);
                
                if(lastIrrigationEvent != null && newIrrigationEvents != null && newIrrigationEvents.Count > 0)
                   newIrrigationEvents.Add(lastIrrigationEvent);

                if (newIrrigationEvents.Count == 0)
                {
                    return new ProcessResponse(true, new SaveResponse());
                }

                CalculationSetting irrigationVolumeSetting = calculationSettings.Where(x => x.Name == "IrrigationVolume").FirstOrDefault();
                IList<MeasurementBase> irrigationVolume = await _agriSmartApiClient.GetMeasurementsBase(formattedDateTimeSinceLastIrrigationStart, formattedNowDate, cropProduction.Id, Convert.ToInt32(irrigationVolumeSetting.Value), token) ?? new List<MeasurementBase>();

                CalculationSetting drainVolumeSetting = calculationSettings.Where(x => x.Name == "DrainVolume").FirstOrDefault();
                IList<MeasurementBase> drainVolume = await _agriSmartApiClient.GetMeasurementsBase(formattedDateTimeSinceLastIrrigationStart, formattedNowDate, cropProduction.Id, Convert.ToInt32(drainVolumeSetting.Value), token) ?? new List<MeasurementBase>();

                CalculationSetting electroConductivityMeasurementVariableId = calculationSettings.Where(x => x.Name == "ElectroCondutivityMeasurementVariableId").FirstOrDefault();
                IList<MeasurementBase> electroConductivities = await _agriSmartApiClient.GetMeasurementsBase(formattedDateTimeSinceLastIrrigationStart, formattedNowDate, cropProduction.Id, Convert.ToInt32(electroConductivityMeasurementVariableId.Value), token) ?? new List<MeasurementBase>();

                CalculationSetting volumetricHumedityMeasurementVariableId = calculationSettings.Where(x => x.Name == "GrowingMediumVolumetricWaterContentMeasurementVariableId").FirstOrDefault();
                IList<MeasurementBase> volumetricHumedities = await _agriSmartApiClient.GetMeasurementsBase(formattedDateTimeSinceLastIrrigationStart, formattedNowDate, cropProduction.Id, Convert.ToInt32(volumetricHumedityMeasurementVariableId.Value), token) ?? new List<MeasurementBase>();

                IList<IrrigationEvent> IrrigationEventsWithMeasurements = GetIrrigationEventMeasurements(newIrrigationEvents, irrigationVolume, drainVolume, electroConductivities, volumetricHumedities, calculationSettings, userTime);

                List<IrrigationEventEntity> irrigationEventEntities = new List<IrrigationEventEntity>();
                
                if(lastIrrigationEvent != null)
                    irrigationEventEntities.Add(new IrrigationEventEntity(lastIrrigationEvent));

                foreach (IrrigationEvent irrigationEvent in IrrigationEventsWithMeasurements.Where(x=> x.DateTimeEnd != DateTime.MinValue))
                {
                    IrrigationMeasurement vol = irrigationEvent.IrrigationEventMeasurements.Where(x => x.MeasurementVariableId == Convert.ToInt32(irrigationVolumeSetting.Value)).FirstOrDefault();
                    
                    if (vol.RecordValue > 0)
                    {
                        IrrigationEventEntity newIrrigationEventEntity = new IrrigationEventEntity(irrigationEvent);
                        irrigationEventEntities.Add(newIrrigationEventEntity);
                    }
                }


                IrrigationCalculations.SetIrrigationMetrics(irrigationEventEntities, calculationSettings, cropProduction);

                var orderedListToSave = irrigationEventEntities.OrderBy(x => x.DateTimeStart).ToList();

                SaveResponse responseSaveIrrigationEvents = await SaveIrrigationEvents(orderedListToSave);

                return new ProcessResponse(true, responseSaveIrrigationEvents);

            }
            catch (Exception ex)
            {
                return new ProcessResponse(ex.Message);
            }

        }

        private async Task<bool> SaveIrrigationEvents(IList<IrrigationEvent> irrigationEvents, string token)
        {
            bool saveSuccess = false;

            foreach (IrrigationEvent irrigationEvent in irrigationEvents)
            {
                Response<CreateIrrigationEventResponse> response = await _agriSmartApiClient.CreateIrrigationEvent(irrigationEvent, token);
                saveSuccess = response.Success;
            }

            return saveSuccess;
        }
        private static IList<IrrigationEvent> GetCropProductionIrrigationEvents(
            CropProductionEntity cropProduction,
            IList<CalculationSetting> calculationSettings,
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

                    currentEvent.Id = 0;
                    currentEvent.CropProductionId = cropProduction.Id;
                    currentEvent.DateTimeStart = orderedReading[i].RecordDate;
                    currentEvent.RecordDateTime = orderedReading[i].RecordDate;

                    IrrigationMeasurement initialPressureMeasurement = new IrrigationMeasurement
                    {
                        MeasurementVariableId = Convert.ToInt32(initialPressureSetting.Value),
                        RecordValue = current
                    };
                    currentEvent.IrrigationEventMeasurements.Add(initialPressureMeasurement);
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

                    currentEvent.IrrigationEventMeasurements.Add(MaximumPressureMeasurement);

                    currentEvent = null;

                    maxPressure = 0;
                    current = 0;
                }

                if (current > maxPressure)
                    maxPressure = current;
            }

            return result;
        }

        private static IList<IrrigationEvent> GetCropProductionIrrigationEventsByMinPressure(
    CropProductionEntity cropProduction,
    IList<CalculationSetting> calculationSettings,
    IList<MeasurementBase> readings)
        {
            if (readings == null || readings.Count < 2)
                return null;

            CalculationSetting initialPressureSetting = calculationSettings.Where(x => x.Name == "IrrigationPressureThreshold").FirstOrDefault();
            CalculationSetting maximumPressureSetting = calculationSettings.Where(x => x.Name == "MaximumPressureMeasurementVariableId").FirstOrDefault();
            //CalculationSetting deltaPressure = calculationSettings.Where(x => x.Name == "PressureDeltaThreshold").FirstOrDefault();

            var result = new List<IrrigationEvent>();
            bool isPumpOn = false;
            double initialPressure = 0;
            double maxPressure = 0;

            IrrigationEvent currentEvent = null;


            IList<MeasurementBase> orderedReading = readings.OrderBy(x => x.RecordDate).ToList();

            double pressureThreshold = Convert.ToDouble(initialPressureSetting.Value);

            for (int i = 0; i < orderedReading.Count; i++)
            {
                double current = orderedReading[i].RecordValue;

                if (!isPumpOn && current >= pressureThreshold)
                {
                    // Pump turned on
                    if (currentEvent == null)
                        currentEvent = new IrrigationEvent();

                    currentEvent.Id = 0;
                    currentEvent.CropProductionId = cropProduction.Id;
                    currentEvent.DateTimeStart = orderedReading[i].RecordDate;
                    currentEvent.RecordDateTime = orderedReading[i].RecordDate;

                    IrrigationMeasurement initialPressureMeasurement = new IrrigationMeasurement
                    {
                        MeasurementVariableId = Convert.ToInt32(initialPressureSetting.Value),
                        RecordValue = orderedReading[i].RecordValue
                    };

                    currentEvent.IrrigationEventMeasurements.Add(initialPressureMeasurement);
                    isPumpOn = true;
                }
                else if (isPumpOn && current <= pressureThreshold && currentEvent != null)
                {
                    currentEvent.DateTimeEnd = orderedReading[i].RecordDate;
                    isPumpOn = false;

                    IrrigationMeasurement MaximumPressureMeasurement = new IrrigationMeasurement
                    {
                        MeasurementVariableId = Convert.ToInt32(maximumPressureSetting.Value),
                        RecordValue = maxPressure
                    };

                    currentEvent.IrrigationEventMeasurements.Add(MaximumPressureMeasurement);
                    result.Add(currentEvent);

                    currentEvent = null;

                    maxPressure = 0;
                    current = 0;
                }

                if (current > maxPressure)
                    maxPressure = current;
            }

            return result;
        }

        private static IList<IrrigationEvent> GetIrrigationEventMeasurements(
            IList<IrrigationEvent> irrigationEvents, 
            IList<MeasurementBase> waterInputs, 
            IList<MeasurementBase> waterDrains,
            IList<MeasurementBase> electroConditivities,
            IList<MeasurementBase> volumetricHumedities,
            IList<CalculationSetting> calculationSettings,
            DateTime localTime)
        {
            CalculationSetting irrigationVolumenCalculationSetting = calculationSettings.Where(x => x.Name == "IrrigationVolume").FirstOrDefault();
            CalculationSetting drainVolumenCalculationSetting = calculationSettings.Where(x => x.Name == "DrainVolume").FirstOrDefault();
            CalculationSetting drainDelayCalculationSetting = calculationSettings.Where(x => x.Name == "DrainDelayMeasurementVariableId").FirstOrDefault();
            CalculationSetting drainLengthCalculationSetting = calculationSettings.Where(x => x.Name == "DrainLengthMeasurementVariableId").FirstOrDefault();
            CalculationSetting electroConductivityCalculationSetting = calculationSettings.Where(x => x.Name == "ElectroCondutivityMeasurementVariableId").FirstOrDefault();
            CalculationSetting volumetricHumedityCalculationSetting = calculationSettings.Where(x => x.Name == "GrowingMediumVolumetricWaterContentMeasurementVariableId").FirstOrDefault();
            CalculationSetting maxVolumetricWaterContentLastReadingDelayMinutesSetting = calculationSettings.Where(x => x.Name == "MaxVolumetricWaterContentLastReadingDelayMinutes").FirstOrDefault();
            CalculationSetting maxElectroConductivityLastReadingDelayMinutesSetting = calculationSettings.Where(x => x.Name == "MaxElectroConductivityLastReadingDelayMinutes").FirstOrDefault();
            CalculationSetting minElectroConductivityAtIrrigationStartMeasurementVariableIdSetting = calculationSettings.Where(x => x.Name == "MinElectroConductivityAtIrrigationStartMeasurementVariableId").FirstOrDefault();
            CalculationSetting maxElectroConductivityAtIrrigationEndMeasurementVariableIdSetting = calculationSettings.Where(x => x.Name == "MaxElectroConductivityAtIrrigationEndMeasurementVariableId").FirstOrDefault();
            CalculationSetting minVolumetricHumedityAtIrrigationStartMeasurementVariableIdSetting = calculationSettings.Where(x => x.Name == "MinVolumetricHumedityAtIrrigationStartMeasurementVariableId").FirstOrDefault();
            CalculationSetting maxVolumetricHumedityAtIrrigationEndMeasurementVariableIdSetting = calculationSettings.Where(x => x.Name == "MaxVolumetricHumedityAtIrrigationEndMeasurementVariableId").FirstOrDefault();           

            IList<IrrigationEvent> orderedIrrigationEvents = irrigationEvents.OrderByDescending(x=> x.DateTimeStart).ToList();

            for (int i = 0; i < orderedIrrigationEvents.Count; i++)
            {
                DateTime limitDateTime = orderedIrrigationEvents[i].DateTimeEnd;

                DateTime drainLimitDateTime = localTime;

                if (i > 0 && i < orderedIrrigationEvents.Count - 1)
                    drainLimitDateTime = orderedIrrigationEvents[i - 1].DateTimeStart;

                if (orderedIrrigationEvents[i].DateTimeEnd == DateTime.MinValue)
                {
                    limitDateTime = localTime;
                }

                DateTime startLimit = orderedIrrigationEvents[i].DateTimeStart.AddSeconds(-1);

                IList<MeasurementBase> irrigationEventWaterInputs = waterInputs.Where(x => x.RecordDate >= startLimit && x.RecordDate <= limitDateTime).OrderBy(x => x.RecordDate).ToList() ?? new List<MeasurementBase>();

                var irrigatedPerSensor = irrigationEventWaterInputs
                .GroupBy(x => x.SensorId)
                .Select(g => new
                {
                    Sensor = g.Key,
                    TotalIrrigated = g.Sum(x => x.RecordValue)
                })
                .ToList();

                double irrigationVolume = irrigatedPerSensor.Any()
                    ? irrigatedPerSensor.Average(x => x.TotalIrrigated)
                    : 0;

              
                IrrigationMeasurement totalIrrigationVolumeMeasurement = new IrrigationMeasurement
                {
                    MeasurementVariableId = Convert.ToInt32(irrigationVolumenCalculationSetting.Value),
                    RecordValue = irrigationVolume
                };

                orderedIrrigationEvents[i].IrrigationEventMeasurements.Add(totalIrrigationVolumeMeasurement);

                IList<MeasurementBase> irrigationEventDrains = waterDrains.Where(x => x.RecordDate >= orderedIrrigationEvents[i].DateTimeStart && x.RecordDate <= drainLimitDateTime).OrderBy(x => x.RecordDate).ToList() ?? new List<MeasurementBase>();

                var drainPerSensor = irrigationEventDrains
                .Where(x => x.RecordValue > 0)
                .GroupBy(x => x.SensorId)
                .Select(g => new
                {
                    SensorId = g.Key,
                    TotalDrained = g.Sum(x => x.RecordValue),
                    MinDate = g.Min(x => x.RecordDate),
                    MaxDate = g.Max(x => x.RecordDate)
                });

                double drainedVolume = drainPerSensor.Any()
                    ? drainPerSensor.Average(x => x.TotalDrained)
                    : 0;

                DateTime firstReading = drainPerSensor.Any()
                    ? drainPerSensor.Min(x => x.MinDate)
                    : DateTime.MinValue;

                DateTime lastReading = drainPerSensor.Any()
                    ? drainPerSensor.Max(x => x.MaxDate)
                    : DateTime.MinValue;

                double drainDelay = 0.0;

                if (firstReading != DateTime.MinValue)
                    drainDelay = firstReading.Subtract(orderedIrrigationEvents[i].DateTimeStart).TotalMinutes;
                
                double drainLength = 0.0;

                if (lastReading != DateTime.MinValue)
                    drainLength = lastReading.Subtract(orderedIrrigationEvents[i].DateTimeStart).TotalMinutes;


                IrrigationMeasurement totalDrainVolumeMeasurement = new IrrigationMeasurement
                {
                    MeasurementVariableId = Convert.ToInt32(drainVolumenCalculationSetting.Value),
                    RecordValue = drainedVolume
                    //RecordValue = 0.0720
                };

                orderedIrrigationEvents[i].IrrigationEventMeasurements.Add(totalDrainVolumeMeasurement);

                IrrigationMeasurement totalDrainDelayMeasurement = new IrrigationMeasurement
                {
                    MeasurementVariableId = Convert.ToInt32(drainDelayCalculationSetting.Value),
                    RecordValue = drainDelay
                };

                orderedIrrigationEvents[i].IrrigationEventMeasurements.Add(totalDrainDelayMeasurement);

                IrrigationMeasurement totalDrainLengthMeasurement = new IrrigationMeasurement
                {
                    MeasurementVariableId = Convert.ToInt32(drainLengthCalculationSetting.Value),
                    RecordValue = drainLength - drainDelay
                };

                orderedIrrigationEvents[i].IrrigationEventMeasurements.Add(totalDrainLengthMeasurement);

                DateTime previousElectroConditivitiesLimit = orderedIrrigationEvents[i].DateTimeStart.AddMinutes(Convert.ToInt32(maxElectroConductivityLastReadingDelayMinutesSetting.Value) * -1);

                IList<MeasurementBase> previousConductivities = electroConditivities.Where(x=> x.RecordDate >= previousElectroConditivitiesLimit && x.RecordDate <= orderedIrrigationEvents[i].DateTimeStart).OrderBy(x => x.RecordDate).ToList() ?? new List<MeasurementBase>();

                var minElectroConductivitiesBySensor = previousConductivities
                 .Where(x => x.RecordValue > 0)
                 .GroupBy(x => x.SensorId)
                 .Select(g => new
                 {
                     SensorId = g.Key,
                     MinValue = g.Min(x => x.RecordValue)
                 });

                double minElectroCondutivityAtIrrigationStart = minElectroConductivitiesBySensor.Any()
                    ? minElectroConductivitiesBySensor.Min(x => x.MinValue)
                    : 0;

                IrrigationMeasurement minElectroCondutivityAtIrrigationStartMeasurement = new IrrigationMeasurement
                {
                    MeasurementVariableId = Convert.ToInt32(minElectroConductivityAtIrrigationStartMeasurementVariableIdSetting.Value),
                    RecordValue = minElectroCondutivityAtIrrigationStart
                };

                orderedIrrigationEvents[i].IrrigationEventMeasurements.Add(minElectroCondutivityAtIrrigationStartMeasurement);


                DateTime subsequentElectroConditivitiesLimit = orderedIrrigationEvents[i].DateTimeEnd.AddMinutes(Convert.ToInt32(maxElectroConductivityLastReadingDelayMinutesSetting.Value));

                IList<MeasurementBase> subsequentConductivities = electroConditivities.Where(x => x.RecordDate >= orderedIrrigationEvents[i].DateTimeEnd && x.RecordDate <= subsequentElectroConditivitiesLimit).OrderBy(x => x.RecordDate).ToList() ?? new List<MeasurementBase>();

                var maxElectroConductivitiesBySensor = subsequentConductivities
                 .Where(x => x.RecordValue > 0)
                 .GroupBy(x => x.SensorId)
                 .Select(g => new
                 {
                     SensorId = g.Key,
                     MaxValue = g.Max(x => x.RecordValue)
                 });

                double maxElectroCondutivityAtIrrigationEnd = maxElectroConductivitiesBySensor.Any()
                    ? maxElectroConductivitiesBySensor.Max(x => x.MaxValue)
                    : 0;

                IrrigationMeasurement maxElectroCondutivityAtIrrigationEndMeasurement = new IrrigationMeasurement
                {
                    MeasurementVariableId = Convert.ToInt32(maxElectroConductivityAtIrrigationEndMeasurementVariableIdSetting.Value),
                    RecordValue = maxElectroCondutivityAtIrrigationEnd
                };

                orderedIrrigationEvents[i].IrrigationEventMeasurements.Add(maxElectroCondutivityAtIrrigationEndMeasurement);

                DateTime previousVolumetricHumedityLimit = orderedIrrigationEvents[i].DateTimeStart.AddMinutes(Convert.ToInt32(maxVolumetricWaterContentLastReadingDelayMinutesSetting.Value) * -1);

                IList<MeasurementBase> previousHumedities = volumetricHumedities.Where(x => x.RecordDate >= previousVolumetricHumedityLimit && x.RecordDate <= orderedIrrigationEvents[i].DateTimeStart).OrderBy(x => x.RecordDate).ToList() ?? new List<MeasurementBase>();

                var minVolumetricHumedityBySensor = previousHumedities
                 .Where(x => x.RecordValue > 0)
                 .GroupBy(x => x.SensorId)
                 .Select(g => new
                 {
                     SensorId = g.Key,
                     MinValue = g.Min(x => x.RecordValue)
                 });

                double minVolumetricHumedityAtIrrigationStart = minVolumetricHumedityBySensor.Any()
                    ? minVolumetricHumedityBySensor.Min(x => x.MinValue)
                    : 0;

                IrrigationMeasurement minVolumetricHumedityAtIrrigationStartMeasurement = new IrrigationMeasurement
                {
                    MeasurementVariableId = Convert.ToInt32(minVolumetricHumedityAtIrrigationStartMeasurementVariableIdSetting.Value),
                    RecordValue = minVolumetricHumedityAtIrrigationStart
                };

                orderedIrrigationEvents[i].IrrigationEventMeasurements.Add(minVolumetricHumedityAtIrrigationStartMeasurement);

                DateTime subsequentVolumetricHumeditiesLimit = orderedIrrigationEvents[i].DateTimeEnd.AddMinutes(Convert.ToInt32(maxVolumetricWaterContentLastReadingDelayMinutesSetting.Value));

                IList<MeasurementBase> subsequentHumedities = volumetricHumedities.Where(x => x.RecordDate >= orderedIrrigationEvents[i].DateTimeEnd && x.RecordDate <= subsequentVolumetricHumeditiesLimit).OrderBy(x => x.RecordDate).ToList() ?? new List<MeasurementBase>();

                var maxVolumetricHumeditiesBySensor = volumetricHumedities
                 .Where(x => x.RecordValue > 0)
                 .GroupBy(x => x.SensorId)
                 .Select(g => new
                 {
                     SensorId = g.Key,
                     MaxValue = g.Max(x => x.RecordValue)
                 });

                double maxVolumetricHumeditiesAtIrrigationEnd = maxVolumetricHumeditiesBySensor.Any()
                    ? maxVolumetricHumeditiesBySensor.Max(x => x.MaxValue)
                    : 0;

                IrrigationMeasurement maxVolumetricHumedityAtIrrigationEndMeasurement = new IrrigationMeasurement
                {
                    MeasurementVariableId = Convert.ToInt32(maxVolumetricHumedityAtIrrigationEndMeasurementVariableIdSetting.Value),
                    RecordValue = maxVolumetricHumeditiesAtIrrigationEnd
                };

                orderedIrrigationEvents[i].IrrigationEventMeasurements.Add(maxVolumetricHumedityAtIrrigationEndMeasurement);
            }

            return orderedIrrigationEvents;
        }


        private async Task<SaveResponse> SaveIrrigationEvents(List<IrrigationEventEntity> irrigationEvents)
        {
            SaveResponse output = new SaveResponse();

            try
            {
                foreach (IrrigationEventEntity irrigationEvent in irrigationEvents.Where(x => x.Id == 0).ToList())
                {
                    IrrigationEvent newEvent = new IrrigationEvent(irrigationEvent);

                    var response = await _agriSmartApiClient.CreateIrrigationEvent(newEvent, _token);

                    if (response.Success)
                        output.TotalMeasurementSucceed += 1;
                    else
                    {
                        output.TotalMeasurementFailed += 1;
                    }
                }

                return output;
            }
            catch (Exception)
            {
                return output;
            }

        }



    }
}
