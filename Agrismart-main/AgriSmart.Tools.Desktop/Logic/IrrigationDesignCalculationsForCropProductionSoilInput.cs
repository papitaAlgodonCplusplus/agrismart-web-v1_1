using AgriSmart.Tools.Entities;
using System;
using static AgriSmart.Tools.Common.Enums;

namespace AgriSmart.Tech.Calculations
{
    public class IrrigationDesignCalculationsForCropProductionSoilInput
    {
        public CropProductionSoilEntity cropProductionSoil {  get; set; }
        public WaterEntity Water { get; set; }
        public int NumberOfIrrigationLateralsPerRow { get; set; }
        public int MaximumElectroconductivityAllowed { get; set; }
        public int UniformityCoefficient { get; set; }
        public DateTime Date { get; set; }
        public double TempMax { get; set; } 
        public double TempMin { get; set; }
        public double TempAvg { get; set; }
        public double RelativeHumidityMax { get; set; }
        public double RelativeHumidityMin { get; set; }
        public double RelativeHumidityAvg { get; set; }
        public double WindSpeed { get; set; }
        public double WindSpeedMeasurementHeight { get; set; }
        public int Height { get; set; }
        public double LatitudeGrades { get; set; }
        public int LatitudeMinutes { get; set; }
        public EToReferenceMethod EToReferenceMethod { get; set; }
        public double CropCoefficient { get; set; }
        public IrrigationSystem IrrigationSystem { get; set; }
        public int IrrigationSystemEfficiency { get; set; } //used ranges in the interface
        public double BetweenDropperDistance { get; set; }//should be calculated
        public int NumberOfDropperPerPlant { get; set; }

    }
}
