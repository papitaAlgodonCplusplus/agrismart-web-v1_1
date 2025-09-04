using AgriSmart.AgronomicProcess.Entities;
using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Logic
{
    public static class CalculationsIrrigation
    {
        public static List<IrrigationMetric> GetIrrigationMetrics(CalculationInput dataModel, DateTime date)
        {
            if (dataModel.IrrigationData != null)
            {
                List<IrrigationMetric> irrigationMetrics = new List<IrrigationMetric>();

                List<IrrigationEventEntity> irrigationEvents = dataModel.IrrigationData.Where(x => x.DateTimeStart >= date && x.DateTimeEnd <= date.AddDays(1).AddSeconds(-1)).OrderBy(x => x.DateTimeStart).ToList();

                for (int i = 0; i < irrigationEvents.Count; i++)
                {
                    List<IrrigationEventEntity> inputs = new List<IrrigationEventEntity>();

                    inputs.Add(irrigationEvents[i]);

                    if (i > 0)
                    {
                        inputs.Add(irrigationEvents[i - 1]);
                    }

                    IrrigationMetric output = CalculateIrrigationCalculationOutput(inputs, dataModel.CropProduction, dataModel.MeasurementVariables);
                    irrigationMetrics.Add(output);

                }

                return irrigationMetrics;
            }
            else
                return null;
        }

        public static IrrigationMetric CalculateIrrigationCalculationOutput(List<IrrigationEventEntity> inputs, CropProductionEntity cropProduction, List<MeasurementVariable> measurementVariables)
        {
            IrrigationMetric output = new IrrigationMetric();

            output.Date = inputs[0].RecordDateTime;

            if (inputs.Count > 1)
            {
                output.IrrigationInterval = inputs[0].DateTimeStart - inputs[1].DateTimeEnd;
            }

            output.IrrigationLength = inputs[0].DateTimeEnd - inputs[0].DateTimeStart;
            double densityContainer = 1 / (cropProduction.BetweenRowDistance * cropProduction.BetweenContainerDistance);
            double densityPlant = 1 / (cropProduction.BetweenRowDistance * cropProduction.BetweenPlantDistance);

            MeasurementVariable irrigationVolumeVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 19).FirstOrDefault();
            double irrigationVolumen = inputs[0].IrrigationMeasurements.Where(x => x.MeasurementVariableId == irrigationVolumeVariable.Id).Sum(x => x.RecordValue);
            output.IrrigationVolumenM2 = new Volume(irrigationVolumen * densityContainer, Volume.volumeMeasure.toLitre);
            output.IrrigationVolumenPerPlant = new Volume(output.IrrigationVolumenM2.Value / densityPlant, Volume.volumeMeasure.toLitre);
            output.IrrigationVolumenTotal = new Volume(cropProduction.Area * output.IrrigationVolumenM2.Value, Volume.volumeMeasure.toLitre);

            MeasurementVariable drainVolumeVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 20).FirstOrDefault();
            double drainVolumen = inputs[0].IrrigationMeasurements.Where(x => x.MeasurementVariableId == drainVolumeVariable.Id).Sum(x => x.RecordValue);
            output.DrainVolumenM2 = new Volume(drainVolumen * densityContainer, Volume.volumeMeasure.toLitre);
            output.DrainVolumenPerPlant = new Volume(output.DrainVolumenM2.Value / densityPlant, Volume.volumeMeasure.toLitre);
            output.DrainPercentage = output.DrainVolumenM2.Value / output.IrrigationVolumenM2.Value * 100;
            output.IrrigationFlow = new Volume(irrigationVolumen / output.IrrigationLength.TotalHours, Volume.volumeMeasure.toLitre);
            output.IrrigationPrecipitation = new Volume(output.IrrigationVolumenM2.Value / output.IrrigationLength.TotalHours, Volume.volumeMeasure.none);
            output.CropProductionId = inputs[0].CropProductionId;

                    // List<IrrigationMetric> irrigationMetricsCurrent = irrigationMetrics.Where(x => x.Date >= prevDate && x.Date <= date.AddHours(i)).ToList();

                    //double irrigationVolume = irrigationMetricsCurrent.Sum(x => x.IrrigationVolumenM2.Value);
                    //double drainVolume = irrigationMetricsCurrent.Sum(x => x.DrainVolumenM2.Value);

                    //double previousVolumetricWaterContent = prevWC.AvgValue;
                    //double currentVolumetricWaterContent = currentDateGrowingMediumData[0].AvgValue;
                    //double deltaVolumetricWaterContent = previousVolumetricWaterContent - currentVolumetricWaterContent;

                    //double containerDensity = 1 / (dataModel.CropProduction.BetweenContainerDistance * dataModel.CropProduction.BetweenRowDistance);
                    //double containerMediumVolumen = dataModel.CropProduction.Container.Volume.Value * containerDensity;

                    //double CropEvapoTranspiration = irrigationVolume - drainVolume - containerMediumVolumen * (deltaVolumetricWaterContent / 100);


            return output;
        }

    }
}
