using AgriSmart.Calculator.Entities;
using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Logic
{
    public static class Calculations
    {
        public static List<GlobalOutput> Calculate(CalculationInput dataModel)
        {
            List<GlobalOutput> globalOutput = new List<GlobalOutput>();

            List<DateTime> dates = new List<DateTime>();

            for (var dt = dataModel.StartingDate; dt <= dataModel.EndingDate; dt = dt.AddDays(1))
            {
                dates.Add(dt);
            }

            foreach (DateTime date in dates)
            {
                GlobalOutput currentDateOutput = new GlobalOutput();
                currentDateOutput.Date = date;

                List<Measurement> climateMeasurementsList = dataModel.ClimateData.Where(x => x.RecordDate.Date == date.Date).OrderBy(x => x.RecordDate).ToList();
                List<IrrigationMetric> irrigationMetrics = CalculationsIrrigation.GetIrrigationMetrics(dataModel, date);
                List<Measurement> growingMediumMetrics = dataModel.GrowingMediumData.Where(x => x.RecordDate.Date == date.Date).OrderBy(x => x.RecordDate).ToList();

                currentDateOutput.Date = date;
                currentDateOutput.IrrigationMetrics = irrigationMetrics;
                currentDateOutput.CropProduction = dataModel.CropProduction;

                DateTime prevDate = date;


                List<Measurement> previousDateGrowingMediumData = growingMediumMetrics.OrderByDescending(x => x.RecordDate).ToList();

                //List<Metrics> hourlyMetrics = new List<Metrics>();

                DateTime CurrentTime = date.AddHours(-1);

                int nHours = 24;

                if (dataModel.StartingDate.Date == dataModel.EndingDate.Date)
                    nHours = dataModel.EndingDate.Hour;

                for (int i = 1; i <= 24; i++)
                {
                    CurrentTime = CurrentTime.AddHours(1);

                    KPIsOutput KPsOutput = new KPIsOutput();

                    if (currentDateOutput.KPIs == null)
                        currentDateOutput.KPIs = new List<KPIsOutput>();
                    currentDateOutput.KPIs.Add(KPsOutput);

                    List<Measurement> climateMeasurements = dataModel.ClimateData.Where(x => x.RecordDate == CurrentTime).ToList();

                    if (climateMeasurements.Count > 0)
                    {
                        KPsOutput = CalculationsClimate.Calculate(date, dataModel.MeasurementVariables, climateMeasurements, dataModel.CropProduction);
                    }


                    IrrigationEventEntity lastIrrigationEvent = dataModel.IrrigationData.Where(x => x.DateTimeStart < CurrentTime).OrderBy(x => x.DateTimeStart).FirstOrDefault();
                    
                    if (lastIrrigationEvent != null)//aca se debe calcular la ETC actual con base a la humedad volumentrica 
                    {
                    }


                    List<Measurement> currentDateGrowingMediumData = growingMediumMetrics.Where(x => x.RecordDate >= prevDate && x.RecordDate <= date.AddHours(i)).ToList();

                    Measurement prevWC = null;

                    if (i == 1 && previousDateGrowingMediumData.Count > 0)
                    {
                        prevWC = previousDateGrowingMediumData[0];
                    }
                    else
                    {
                        prevWC = currentDateGrowingMediumData[0];
                    }

                    List<IrrigationMetric> irrigationMetricsCurrent = irrigationMetrics.Where(x => x.Date >= prevDate && x.Date <= date.AddHours(i)).ToList();

                    double irrigationVolume = irrigationMetricsCurrent.Sum(x => x.IrrigationVolumenM2.Value);
                    double drainVolume = irrigationMetricsCurrent.Sum(x => x.DrainVolumenM2.Value);

                    double previousVolumetricWaterContent = prevWC.AvgValue;
                    double currentVolumetricWaterContent = currentDateGrowingMediumData[0].AvgValue;
                    double deltaVolumetricWaterContent = previousVolumetricWaterContent - currentVolumetricWaterContent;

                    double containerDensity = 1 / (dataModel.CropProduction.BetweenContainerDistance * dataModel.CropProduction.BetweenRowDistance);
                    double containerMediumVolumen = dataModel.CropProduction.Container.Volume.Value * containerDensity;

                    double CropEvapoTranspiration = irrigationVolume - drainVolume - containerMediumVolumen * (deltaVolumetricWaterContent / 100);

                    KPsOutput.CropEvapoTranspiration = CropEvapoTranspiration;

                    //currentMetric.CropEvapoTranspiration = new Volume(CropEvapoTranspiration, Volume.volumeMeasure.toLitre);

                    //hourlyMetrics.Add(currentMetric);
                }

                //currentDateOutput.HourlyMetrics = hourlyMetrics;

                globalOutput.Add(currentDateOutput);
            }

            //var options = new JsonSerializerOptions { WriteIndented = true, NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowNamedFloatingPointLiterals };
            //string jsonOutputString = JsonSerializer.Serialize(globalOutput, options);

            return globalOutput;
        }
    }
}
