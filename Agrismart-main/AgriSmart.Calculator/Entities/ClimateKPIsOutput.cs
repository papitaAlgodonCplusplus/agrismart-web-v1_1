using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Entities
{
    public class KPIsOutput
    {
        //inputs
        public double TempMin { get; set; }
        public double TempMax { get; set; }
        public double TempAvg { get; set; }
        public double RelativeHumidtyMin { get; set; }
        public double RelativeHumidtyMax { get; set; }
        public double RelativeHumidtyAvg { get; set; }
        public DateTime Date { get; set; }
        public double LatitudeInGrades { get; set; }
        public double LatitudeInMinutes { get; set; }
        public int Altitude { get; set; }
        public double WindSpeed { get; set; }
        public double WindSpeedMeasurementHeight { get; set; }


        public double SaturationVaporPressureAtMaxTemp { get; set; }
        public double SaturationVaporPressureAtMinTemp { get; set; }
        public double SaturationVaporPressureAtAvgTemp { get; set; }
        public double RealVaporPressureAtMaxRelativeHumidity { get; set; }
        public double RealVaporPressureAtMinRelativeHumidity { get; set; }
        public double RealVaporPressureAtAvgRelativeHumidity { get; set; }
        public double VaporPressureDeficitAtMaxTemp { get; set; }
        public double VaporPressureDeficitAtMimTemp { get; set; }
        public double VaporPressureDeficitAtAvgTemp { get; set; }
        public double ExtraTerrestrialRadiationAsEnergy { get; set; }
        public double ExtraTerrestrialRadiationAsWater { get; set; }
        public double IncidentSolarRadiation { get; set; }
        public double SolarRadiationForAClearDay { get; set; }
        public double NetShortwaveSolarRadiation { get; set; }
        public double NetLongwaveSolarRadiation { get; set; }
        public double NetSolarRadiation { get; set; }
        public double AerodynamicResistance { get; set; }
        public double ReferenceCropSurfaceResistance { get; set; }
        public double EvapotranspirationRadiationTerm { get; set; }
        public double AerodynamicEvapotranspirationRadiationTerm { get; set; }
        public double EvapotranspirationReferencePenmanMontiehtFAO56 { get; set; }
        public double EvapotranspirationReferenceHargreaves { get; set; }
        public double CropEvapoTranspiration { get; set; }
        public double DegreesDay { get; set; }
        public double LightIntegralPAR { get; set; }
        public double LightIntegralGlobal { get; set; }

    }
}
