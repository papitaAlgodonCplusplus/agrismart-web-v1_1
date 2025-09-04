using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Entities
{
    public class ClimateMeasurementEntity
    {
        public DateTime DateTime { get; set; }
        public int CropProductionId { get; set; }
        public double TempMin { get; set; }
        public double TempMax { get; set; }
        public double TempAvg { get; set; }
        public double RelativeHumidityMin { get; set; }
        public double RelativeHumidityMax { get; set; }
        public double RelativeHumidityAvg { get; set; }
        //public double LatitudeInGrades { get; set; }
        //public int LatitudeInMinutes { get; set; }
        //public int Height { get; set; }
        public double WindSpeedMin { get; set; } // wind speed as km/hour
        public double WindSpeedMax { get; set; } // wind speed as km/hour
        public double WindSpeedAvg { get; set; } // wind speed as km/hour
        public double WindSpeedMeasurementHeight { get; set; } // wind speed measurement height
        public double PhotosyntheticallyActiveRadiationMin { get; set; } //PAR umol/m2/hour 
        public double PhotosyntheticallyActiveRadiationMax { get; set; } //PAR umol/m2/hour 
        public double PhotosyntheticallyActiveRadiationAvg { get; set; } //PAR umol/m2/hour 
        public double TotalSolarRadiationMin { get; set; } //global radiation watts/m2/hour 
        public double TotalSolarRadiationMax { get; set; } //global radiation watts/m2/hour 
        public double TotalSolarRadiationAvg { get; set; } //global radiation watts/m2/hour 

        public ClimateMeasurementEntity()
        {
        }

        public ClimateMeasurementEntity(DateTime date, int cropProductionId, double tempMin, double tempMax, double tempAvg, double relativeHumidtyMin, double relativeHumidtyMax, double relativeHumidtyAvg, double windSpeedMin, double windSpeedMax, double windSpeedAvg, double windSpeedMeasurementHeight, double totalSolarRadiationAvg)
        {
            DateTime = date;
            CropProductionId = cropProductionId;
            TempMin = tempMin;
            TempMax = tempMax;
            TempAvg = tempAvg;
            RelativeHumidityMin = relativeHumidtyMin;
            RelativeHumidityMax = relativeHumidtyMax;
            RelativeHumidityAvg = relativeHumidtyAvg;
            //LatitudeInGrades = latitudeInGrades;
            //LatitudeInMinutes = latitudeInMinutes;
            //Height = height;
            WindSpeedMin = windSpeedMin;
            WindSpeedMax = windSpeedMax;
            WindSpeedAvg = windSpeedAvg;
            WindSpeedMeasurementHeight = windSpeedMeasurementHeight;
            TotalSolarRadiationAvg = totalSolarRadiationAvg;
        }
    }
}
