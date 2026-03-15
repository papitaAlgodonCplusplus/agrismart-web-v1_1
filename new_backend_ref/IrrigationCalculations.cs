using AgriSmart.AgronomicProcess.Entities;
using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Logic
{
    public static class IrrigationCalculations
    {
        public static void SetIrrigationMetrics(List<IrrigationEventEntity> irrigationEvents, IList<CalculationSetting> settings, CropProductionEntity cropProduction)
        {
            for (int i = 0; i < irrigationEvents.Count; i++)
            {
                if (irrigationEvents[i].Id != 0)  //if not is new event
                    continue;

                List<IrrigationEventEntity> inputs = new List<IrrigationEventEntity>();

                inputs.Add(irrigationEvents[i]);

                if (i > 0)
                {
                    inputs.Add(irrigationEvents[i - 1]);
                }

                CalculateIrrigationCalculationOutput(inputs, settings, cropProduction);
            }
        }
        private static IrrigationMeasurementEntity getIrrigationMeasurementEntity(IList<CalculationSetting> settings, string settingName, double value)
        {
            CalculationSetting irrigationIntervalVariableId = settings.Where(x => x.Name == settingName).FirstOrDefault();

            IrrigationMeasurementEntity irrigationIntervalMeasurement = new IrrigationMeasurementEntity()
            {
                Id = 0,
                EventId = 0,
                MeasurementVariableId = Convert.ToInt32(irrigationIntervalVariableId.Value),
                RecordValue = value
            };

            return irrigationIntervalMeasurement;
        }
        public static void CalculateIrrigationCalculationOutput(List<IrrigationEventEntity> events, IList<CalculationSetting> settings, CropProductionEntity cropProduction)
        {
            var current = events[0];

            AddIrrigationIntervalMeasurement(events, settings);
            AddIrrigationLengthMeasurement(current, settings);

            var density = GetDensities(cropProduction);

            double? irrigationVolume = GetMeasurementValue(current, settings, "IrrigationVolume");
            double? drainVolume = GetMeasurementValue(current, settings, "DrainVolume");

            AddIrrigationVolumes(current, settings, cropProduction, irrigationVolume, density);
            AddDrainVolumes(current, settings, drainVolume, density, irrigationVolume);

            AddIrrigationFlow(current, settings, irrigationVolume);
            AddIrrigationPrecipitation(current, settings, irrigationVolume, density);
        }
        private static double? GetMeasurementValue(IrrigationEventEntity evt, IList<CalculationSetting> settings, string settingName)
        {
            var setting = settings.FirstOrDefault(x => x.Name == settingName);
            if (setting == null) return null;

            return evt.IrrigationMeasurements
                      .Where(x => x.MeasurementVariableId == Convert.ToInt32(setting.Value))
                      .Sum(x => (double?)x.RecordValue) ?? null;
        }
        private static void AddIrrigationIntervalMeasurement(List<IrrigationEventEntity> events, IList<CalculationSetting> settings)
        {
            if (events.Count < 2) return;

            var interval = (events[0].DateTimeStart - events[1].DateTimeEnd).TotalMinutes;

            AddMeasurement(events[0], settings, "IrrigationIntervalMeasurementVariableId", interval);
        }
        private static void AddIrrigationLengthMeasurement(IrrigationEventEntity evt, IList<CalculationSetting> settings)
        {
            var minutes = (evt.DateTimeEnd - evt.DateTimeStart).TotalMinutes;
            AddMeasurement(evt, settings, "IrrigationLengthMeasurementVariableId", minutes);
        }
        private static (double container, double plant) GetDensities(CropProductionEntity cp)
        {
            double r = cp.BetweenRowDistance > 0 ? cp.BetweenRowDistance : 1e-9;
            double c = cp.BetweenContainerDistance > 0 ? cp.BetweenContainerDistance : 1e-9;
            double p = cp.BetweenPlantDistance > 0 ? cp.BetweenPlantDistance : 1e-9;

            return (1 / (r * c), 1 / (r * p));
        }
        private static void AddIrrigationVolumes(IrrigationEventEntity evt, IList<CalculationSetting> settings, CropProductionEntity cropProduction, double? irrigationVolume, (double container, double plant) density)
        {
            if (irrigationVolume == null) return;

            double m2 = irrigationVolume.Value * density.container;
            double perPlant = m2 / density.plant;

            AddMeasurement(evt, settings, "IrrigationVolumenM2MeasurementVariableId", m2);
            AddMeasurement(evt, settings, "IrrigationVolumenPerPlantMeasurementVariableId", perPlant);

            // Total by area
            double total = cropProduction.Area * m2;
            AddMeasurement(evt, settings, "IrrigationVolumenTotalMeasurementVariableId", total);
        }
        private static void AddDrainVolumes(IrrigationEventEntity evt, IList<CalculationSetting> settings, double? drainVolume, (double container, double plant) density, double? irrigationVol)
        {
            if (drainVolume == null) return;

            double m2 = drainVolume.Value * density.container;
            double perPlant = m2 / density.plant;

            AddMeasurement(evt, settings, "DrainVolumenM2MeasurementVariableId", m2);
            AddMeasurement(evt, settings, "DrainVolumenPerPlantMeasurementVariableId", perPlant);

            // drain percentage
            if (irrigationVol.Value > 0)
            {
                double percentage = (drainVolume.Value / irrigationVol.Value) * 100;
                AddMeasurement(evt, settings, "DrainPercentageMeasurementVariableId", percentage);
            }
        }
        private static void AddIrrigationFlow(IrrigationEventEntity evt, IList<CalculationSetting> settings, double? volume)
        {
            if (volume == null) return;

            double hours = (evt.DateTimeEnd - evt.DateTimeStart).TotalHours;
            if (hours <= 0) return;

            double flow = volume.Value / hours;
            AddMeasurement(evt, settings, "IrrigationFlowMeasurementVariableId", flow);
        }
        private static void AddIrrigationPrecipitation(IrrigationEventEntity evt, IList<CalculationSetting> settings, double? irrigationVolM2, (double container, double plant) density)
        {
            if (irrigationVolM2 == null) return;

            double hours = (evt.DateTimeEnd - evt.DateTimeStart).TotalHours;
            if (hours <= 0) return;

            double precipitation = (irrigationVolM2.Value * density.container) / hours;
            //AddMeasurement(evt, settings, "IrrigationPrecipitationMeasurementVariableId", precipitation);consulta con Freddy
        }
        private static void AddMeasurement(IrrigationEventEntity evt, IList<CalculationSetting> settings, string measurementSettingName, double? value)
        {
            if (value == null) return;

            evt.IrrigationMeasurements.Add(
                getIrrigationMeasurementEntity(settings, measurementSettingName, value.Value)
            );
        }

    }
}
