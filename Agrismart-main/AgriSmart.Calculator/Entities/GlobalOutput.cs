using AgriSmart.Calculator.Models;
using System.Text.Json.Serialization;

namespace AgriSmart.Calculator.Entities
{
    public class GlobalOutput
    {
        public CropProductionEntity CropProduction { get; set; }
        public DateTime Date { get; set; }
        public List<KPIsOutput> KPIs { get; set; }
        public List<IrrigationMetric> IrrigationMetrics { get; set; }
        //public List<GrowingMediumMetric> GrowingMediumMetrics { get; set; }
        //public List<Metrics> HourlyMetrics { get; set; }
        //public double DegreesDay { get; set; }
        //public double DailyLightIntegralPARAvg { get; set; }
        //public double DailyLightIntegralGlobal { get; set; }
        [JsonIgnore]
        public int IrrigationCount { get { return IrrigationMetrics.Count; } }
        [JsonIgnore]
        public Volume IrrigationVolumenMin { get { return getIrrigationVolumenMin(); } }
        [JsonIgnore]
        public Volume IrrigationVolumenMax { get { return getIrrigationVolumenMax(); } }
        [JsonIgnore]
        public Volume IrrigationVolumenAvg { get { return getIrrigationVolumenAvg(); } }
        [JsonIgnore]
        public Volume IrrigationVolumenSum { get { return getIrrigationVolumenSum(); } }
        [JsonIgnore]
        public TimeSpanMetricStat IrrigationIntervalStat { get { return getIrrigationIntervalStats(true); } }
        [JsonIgnore]
        public TimeSpanMetricStat IrrigationLengthStat { get { return getIrrigationLengthStats(); } }
        [JsonIgnore]
        public double EvapotranspirationReferencePenmanMontiehtFAO56Min { get { return KPIs.Min(x => x.EvapotranspirationReferencePenmanMontiehtFAO56); } }
        [JsonIgnore]
        public double EvapotranspirationReferencePenmanMontiehtFAO56Max { get { return KPIs.Max(x => x.EvapotranspirationReferencePenmanMontiehtFAO56); } }
        [JsonIgnore]
        public double EvapotranspirationReferencePenmanMontiehtFAO56Avg { get { return KPIs.Average(x => x.EvapotranspirationReferencePenmanMontiehtFAO56); } }
        [JsonIgnore]
        public double EvapotranspirationReferenceHargreavesMin { get { return KPIs.Min(x => x.EvapotranspirationReferenceHargreaves); } }
        [JsonIgnore]
        public double EvapotranspirationReferenceHargreavesMax { get { return KPIs.Max(x => x.EvapotranspirationReferenceHargreaves); } }
        [JsonIgnore]
        public double EvapotranspirationReferenceHargreavesAvg { get { return KPIs.Average(x => x.EvapotranspirationReferenceHargreaves); } }
        [JsonIgnore]
        public double SaturationVaporPressureAtAvgTempMin { get { return KPIs.Min(x => x.SaturationVaporPressureAtAvgTemp); } }
        [JsonIgnore]
        public double SaturationVaporPressureAtAvgTempMax { get { return KPIs.Max(x => x.SaturationVaporPressureAtAvgTemp); } }
        [JsonIgnore]
        public double SaturationVaporPressureAtAvgTempAvg { get { return KPIs.Average(x => x.SaturationVaporPressureAtAvgTemp); } }
        [JsonIgnore]
        public double SaturationVaporPressureAtMinTempMin { get { return KPIs.Min(x => x.SaturationVaporPressureAtMinTemp); } }
        [JsonIgnore]
        public double SaturationVaporPressureAtMinTempMax { get { return KPIs.Max(x => x.SaturationVaporPressureAtMinTemp); } }
        [JsonIgnore]
        public double SaturationVaporPressureAtMinTempAvg { get { return KPIs.Average(x => x.SaturationVaporPressureAtMinTemp); } }
        [JsonIgnore]
        public double SaturationVaporPressureAtMaxTempMin { get { return KPIs.Min(x => x.SaturationVaporPressureAtMaxTemp); } }
        [JsonIgnore]
        public double SaturationVaporPressureAtMaxTempMax { get { return KPIs.Max(x => x.SaturationVaporPressureAtMaxTemp); } }
        [JsonIgnore]
        public double SaturationVaporPressureAtMaxTempAvg { get { return KPIs.Average(x => x.SaturationVaporPressureAtMaxTemp); } }
        private TimeSpanMetricStat getIrrigationIntervalStats(bool excludeFirst)
        {
            TimeSpanMetricStat output = new TimeSpanMetricStat();

            List<IrrigationMetric> metrics = new List<IrrigationMetric>();

            if (excludeFirst)
            {
                for (int i = 1; i < IrrigationMetrics.Count; i++)
                {
                    metrics.Add(IrrigationMetrics[i]);
                }
            }
            else
            {
                metrics = IrrigationMetrics;
            }

            if (metrics == null || metrics.Count == 0)
                return null;

            output.Average = TimeSpan.FromMinutes(metrics.Average(x => x.IrrigationInterval.Minutes));
            output.Min = TimeSpan.FromMinutes(metrics.Min(x => x.IrrigationInterval.Minutes));
            output.Max = TimeSpan.FromMinutes(metrics.Max(x => x.IrrigationInterval.Minutes));
            output.Sum = TimeSpan.FromMinutes(metrics.Sum(x => x.IrrigationInterval.Minutes));

            return output;
        }
        private TimeSpanMetricStat getIrrigationLengthStats()
        {
            TimeSpanMetricStat output = new TimeSpanMetricStat();

            List<IrrigationMetric> metrics = new List<IrrigationMetric>();


            if (IrrigationMetrics == null || IrrigationMetrics.Count == 0)
                return null;

            output.Average = TimeSpan.FromMinutes(IrrigationMetrics.Average(x => x.IrrigationLength.Minutes));
            output.Min = TimeSpan.FromMinutes(IrrigationMetrics.Min(x => x.IrrigationLength.Minutes));
            output.Max = TimeSpan.FromMinutes(IrrigationMetrics.Max(x => x.IrrigationLength.Minutes));
            output.Sum = TimeSpan.FromMinutes(IrrigationMetrics.Sum(x => x.IrrigationLength.Minutes));

            return output;
        }
        private Volume getIrrigationVolumenSum()
        {
            double sum = IrrigationMetrics.Sum(x => x.IrrigationVolumenM2.Value);
            return new Volume(sum, Volume.volumeMeasure.toLitre);
        }
        private Volume getIrrigationVolumenMin()
        {
            double sum = IrrigationMetrics.Min(x => x.IrrigationVolumenM2.Value);
            return new Volume(sum, Volume.volumeMeasure.toLitre);
        }
        private Volume getIrrigationVolumenMax()
        {
            double sum = IrrigationMetrics.Max(x => x.IrrigationVolumenM2.Value);
            return new Volume(sum, Volume.volumeMeasure.toLitre);
        }
        private Volume getIrrigationVolumenAvg()
        {
            double sum = IrrigationMetrics.Average(x => x.IrrigationVolumenM2.Value);
            return new Volume(sum, Volume.volumeMeasure.toLitre);
        }

    }
}
