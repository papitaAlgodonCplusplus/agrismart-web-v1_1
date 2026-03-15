using AgriSmart.AgronomicProcess.Entities;
using AgriSmart.AgronomicProcess.Models;


namespace AgriSmart.AgronomicProcess.Logic
{
    public static class KPIsCalculations
    {
        public static List<GlobalOutput> Calculate(KPIsCalculationsInput input)
        {
            List<GlobalOutput> globalOutput = new List<GlobalOutput>();
            CalculationSetting airTemperatureMeasurementVariableId = input.CalculationSettings.Where(x => x.Name == "AirTemperatureMeasurementVariableId").FirstOrDefault();
            CalculationSetting irrigationVolumeMeasurementVariableId = input.CalculationSettings.Where(x => x.Name == "IrrigationVolume").FirstOrDefault();
            CalculationSetting drainVolumeMeasurementVariableId = input.CalculationSettings.Where(x => x.Name == "DrainVolume").FirstOrDefault();

            DateTime start = input.StartingDate.Date;
            DateTime end = input.EndingDate;
            TimeSpan step = TimeSpan.FromDays(1);

            IEnumerable<DateTime> DateRange(DateTime inicio, DateTime fin, TimeSpan intervalo)
            {
                for (DateTime dt = inicio; dt <= fin; dt = dt.Add(intervalo))
                {
                    yield return dt;
                }
            }

            List<Measurement> orderedClimateMeasurementsList = input.ClimateData.OrderBy(x => x.RecordDate).ToList();
            List<Measurement> orderedGrowingMediumMetrics = input.GrowingMediumData.OrderBy(x => x.RecordDate).ToList();
            List<Measurement> orderedIrrigationDate = input.IrrigationData.OrderBy(x => x.RecordDate).ToList();

            foreach (DateTime date in DateRange(start, end, step))
            {
                GlobalOutput currentDateOutput = new GlobalOutput();
                currentDateOutput.Date = date.Date;
                currentDateOutput.CropProduction = input.CropProduction;

                List<Measurement> climateMeasurementsList = orderedClimateMeasurementsList.Where(x => x.RecordDate.Date == date.Date).OrderBy(x => x.RecordDate).ToList();

                MeasurementVariable measurementVariable = input.MeasurementVariables.Where(x => x.Id == Convert.ToInt32(airTemperatureMeasurementVariableId.Value)).FirstOrDefault();
                List<Measurement> tempMeasurements = climateMeasurementsList.Where((x) => x.MeasurementVariableId == measurementVariable.Id).ToList();

                if (tempMeasurements.Count > 0)
                {
                    currentDateOutput.DegreesDay = (tempMeasurements.Max(x => x.MaxValue) + tempMeasurements.Min(x => x.MinValue) / 2) - input.CropProduction.Crop.CropBaseTemperature;
                }

                List<Measurement> growingMediumMetrics = orderedGrowingMediumMetrics.Where(x => x.RecordDate.Date == date.Date).OrderBy(x => x.RecordDate).ToList();

                DateTime prevDate = date.AddDays(-1);

                List<Measurement> previousDateGrowingMediumData = orderedGrowingMediumMetrics.Where(x=> x.RecordDate == prevDate).OrderByDescending(x => x.RecordDate).ToList();

                DateTime CurrentTime = date.AddHours(-1);

                int nHours = 24;

                if (start == input.EndingDate.Date)
                    nHours = input.EndingDate.Hour;

                for (int i = 1; i <= nHours; i++)
                {
                    CurrentTime = CurrentTime.AddHours(1);

                    KPIsOutput KPIsOutput = new KPIsOutput();

                    if (currentDateOutput.KPIs == null)
                        currentDateOutput.KPIs = new List<KPIsOutput>();

                    List<Measurement> climateMeasurements = orderedClimateMeasurementsList.Where(x => x.RecordDate == CurrentTime).ToList();

                    if (climateMeasurements.Count > 0)
                    {
                        KPIsOutput = KPIsCalculationsCalculationsClimate.Calculate(date, input, climateMeasurements, input.CropProduction);
                        currentDateOutput.KPIs.Add(KPIsOutput);
                    }
                    else
                    {
                        continue;
                    }

                    List<Measurement> currentDateGrowingMediumData = growingMediumMetrics.Where(x => x.RecordDate >= prevDate && x.RecordDate <= CurrentTime).ToList();

                    Measurement prevWC = null;

                    if (i == 1)
                    {
                        if (previousDateGrowingMediumData.Count > 0)
                            prevWC = previousDateGrowingMediumData[0];
                    }
                    else
                    {
                        if (currentDateGrowingMediumData.Count > 0)
                            prevWC = currentDateGrowingMediumData[0];
                    }


                    //List<IrrigationEventEntity> irrigationEventsCurrent = input.IrrigationEvents.Where(x => x.DateTimeEnd >= prevDate && x.DateTimeEnd <= date.AddHours(i)).ToList();

                    List<Measurement> irrigationVolumes = orderedIrrigationDate.Where(x => x.RecordDate >= CurrentTime && x.RecordDate < CurrentTime.AddHours(i) && x.MeasurementVariableId == Convert.ToInt32(irrigationVolumeMeasurementVariableId.Value)).ToList();
                    List<Measurement> drainVolumes = orderedIrrigationDate.Where(x => x.RecordDate >= CurrentTime && x.RecordDate < CurrentTime.AddHours(i) && x.MeasurementVariableId == Convert.ToInt32(drainVolumeMeasurementVariableId.Value)).ToList();

                    double previousVolumetricWaterContent = 0;
                    double currentVolumetricWaterContent = 0;
                    double deltaVolumetricWaterContent = 0;

                    if (prevWC != null && currentDateGrowingMediumData.Count > 0)
                    {
                        previousVolumetricWaterContent = prevWC.AvgValue;
                        currentVolumetricWaterContent = currentDateGrowingMediumData[0].AvgValue;
                        deltaVolumetricWaterContent = previousVolumetricWaterContent - currentVolumetricWaterContent;
                    }

                    double containerDensity = 1 / (input.CropProduction.BetweenContainerDistance * input.CropProduction.BetweenRowDistance);
                    double containerMediumVolumen = input.CropProduction.Container.Volume.Value * containerDensity;
                    double irrigationVolume = irrigationVolumes.Sum(x => x.AvgValue);
                    double drainVolume = drainVolumes.Sum(x => x.AvgValue);
                    double CropEvapoTranspiration = irrigationVolume - drainVolume - containerMediumVolumen * (deltaVolumetricWaterContent / 100);
                    KPIsOutput.CropEvapoTranspiration = CropEvapoTranspiration;

                }

                globalOutput.Add(currentDateOutput);
            }

            return globalOutput;
        }
    }
}
