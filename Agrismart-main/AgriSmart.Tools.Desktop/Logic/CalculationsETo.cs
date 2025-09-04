using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.Logic
{
    public class CalculationsETo
    {
        const double SOLAR_CONSTANT = 0.082 * (24 * 60 / Math.PI);
        const double ALBEDO_CONSTANT = 0.23;
        const double STEFANBOLTZMANN_CONSTANT = 0.000000004903;
        const double EARTH_SUN_INVERSE_DISTANCE_CONSTANT = 0.033;
        const double REFERENCE_CROP_SURFACE_RESISTANCE_CONSTANT = 70;//reference crop surface resistance constant
        const double SPECIFIC_HEAT_AT_CONSTANT_PRESSURE_CONSTANT = 0.001013;//specific heat at constant pressure
        const double MOLECULAR_WEIGHT_RATIO_OF_WATER_VAPOR_DRY_AIR = 0.622;//molecular weight of water steam ratio

        private static double getSaturationVaporPressure(double temp)//
        {
            return 0.6108 * Math.Exp(17.27 * temp / (temp + 237.3));
        }

        private static double getRealVaporPressure(double temp, double relativeHumidity)
        {
            return getSaturationVaporPressure(temp) * relativeHumidity / 100;
        }

        public static double getAvgRealVaporPressure(double tempMin, double relativeHumidityMax, double tempMax, double relativeHumidityMin)
        {
            return getRealVaporPressure(tempMin, relativeHumidityMax) + getRealVaporPressure(tempMax, relativeHumidityMin) / 2;
        }

        private static int getNDays(DateTime date)
        {
            int nDays = 365;

            if (DateTime.IsLeapYear(date.Year))
                nDays = 366;

            return nDays;
        }

        private static double getEarthSunInverseDistance(DateTime date)
        {
            return 1 + EARTH_SUN_INVERSE_DISTANCE_CONSTANT * Math.Cos((2 * Math.PI / getNDays(date)) * date.DayOfYear);
        }

        private static double getLatitudeInRadians(double latitudeGrades, int latitudeMinutes)
        {
            return (Math.PI / 180) * (latitudeGrades + latitudeMinutes / 60);
        }

        private static double getSolarInclination(DateTime date)
        {
            return 0.409 * Math.Sin(((2 * Math.PI / getNDays(date)) * date.DayOfYear) - 1.39);
        }

        private static double getSolarSunsetAngle(DateTime date, double latitudeGrades, int latitudeMinutes)
        {
            return Math.Acos(Math.Tan(getLatitudeInRadians(latitudeGrades, latitudeMinutes) * -1) * Math.Tan(getSolarInclination(date)));
        }

        private static double getExtraterrestrialSolarRadiationTerm(DateTime date, double latitudeGrades, int latitudeMinutes)
        {
            return getSolarSunsetAngle(date, latitudeGrades, latitudeMinutes) * Math.Sin(getLatitudeInRadians(latitudeGrades, latitudeMinutes)) * Math.Sin(getSolarInclination(date) + Math.Cos(getLatitudeInRadians(latitudeGrades, latitudeMinutes) * Math.Cos(getSolarInclination(date)) * Math.Sin(getSolarSunsetAngle(date, latitudeGrades, latitudeMinutes))));
        }

        private static double getIsothermalLongwaveRadiationFactor(double tempMax, double tempMin)
        {
            return STEFANBOLTZMANN_CONSTANT * ((Math.Pow((tempMax + 273.16), 4) + Math.Pow((tempMin + 273.16), 4)) / 2);
        }

        private static double getHumidityFactor(double realVaporPressureAtAvgRelativeHumidity)
        {
            return 0.34 - 0.14 * Math.Sqrt(realVaporPressureAtAvgRelativeHumidity);
        }

        private static double getCloudFactor(double relraIrsO)
        {
            return 1.35 * relraIrsO - 0.35;
        }

        private static double getWindSpeedAsMtsPerSecond(double windSpeed, double windSpeedMeasurementHeight)
        {
            return (windSpeed * (1000.0 / 3600.0)) * (4.87 / Math.Log(67.8 * windSpeedMeasurementHeight - 5.42));
        }

        private static double getSlopeVaporPressureCurve(double tempAvg)
        {
            return 4098 * getSaturationVaporPressure(tempAvg) / Math.Pow((tempAvg + 237.3), 2);
        }

        private static double getLatentHeatEvaporation(double tempAvg)
        {
            return 2.501 - (2.361 * Math.Pow(10, -3) * tempAvg);
        }

        private static double getPsychrometricConstant(int height, double tempAverage)
        {
            double p = 101.3 * Math.Pow(((293 - 0.0065 * height) / 293), 5.26);
            return p * (SPECIFIC_HEAT_AT_CONSTANT_PRESSURE_CONSTANT / (MOLECULAR_WEIGHT_RATIO_OF_WATER_VAPOR_DRY_AIR * getLatentHeatEvaporation(tempAverage)));
        }

        public static EToOutput Calculate(DateTime date, double tempMax, double tempMin, double tempAvg, double relativeHumidityMax, double relativeHumidityMin, double relativeHumidityAvg, double windSpeed, double windSpeedMeasurementHeight, int height, double latitudeGrades, int latitudeMinutes)
        {
            double saturationVaporPressureAtMaxTemp;
            double saturationVaporPressureAtMinTemp;
            double saturationVaporPressureAtAvgTemp;
            double realVaporPressureAtMaxRelativeHumidity;
            double realVaporPressureAtMinRelativeHumidity;
            double realVaporPressureAtAvgRelativeHumidity;
            double vaporPressureDeficitAtMaxTemp;
            double vaporPressureDeficitAtMimTemp;
            double vaporPressureDeficitAtAvgTemp;
            double extraTerrestrialRadiationAsEnergy;
            double extraTerrestrialRadiationAsWater = 0;
            double incidentSolarRadiation;
            double solarRadiationForAClearDay;
            double netShortwaveSolarRadiation;
            double netLongwaveSolarRadiation;
            double netSolarRadiation;
            double aerodynamicResistance;
            double referenceCropSurfaceResistance;
            double evapotranspirationRadiationTerm;
            double aerodynamicEvapotranspirationRadiationTerm;
            double evapotranspirationReferencePenmanMontiehtFAO56;
            double evapotranspirationReferenceHargreaves;
            double relraIrsO;

            EToOutput output = new EToOutput();

            saturationVaporPressureAtMaxTemp = getSaturationVaporPressure(tempMax);
            saturationVaporPressureAtMinTemp = getSaturationVaporPressure(tempMin);
            saturationVaporPressureAtAvgTemp = getSaturationVaporPressure(tempAvg);
            realVaporPressureAtMaxRelativeHumidity = saturationVaporPressureAtMinTemp * relativeHumidityMax / 100;
            realVaporPressureAtMinRelativeHumidity = saturationVaporPressureAtMaxTemp * relativeHumidityMin / 100;
            realVaporPressureAtAvgRelativeHumidity = saturationVaporPressureAtAvgTemp * relativeHumidityAvg / 100;
            vaporPressureDeficitAtMaxTemp = saturationVaporPressureAtMaxTemp - realVaporPressureAtMaxRelativeHumidity;
            vaporPressureDeficitAtMimTemp = saturationVaporPressureAtMinTemp - realVaporPressureAtMinRelativeHumidity;
            vaporPressureDeficitAtAvgTemp = saturationVaporPressureAtAvgTemp - realVaporPressureAtAvgRelativeHumidity;
            extraTerrestrialRadiationAsEnergy = SOLAR_CONSTANT * getEarthSunInverseDistance(date) * getExtraterrestrialSolarRadiationTerm(date, latitudeGrades, latitudeMinutes);

            incidentSolarRadiation = 0.178 * Math.Sqrt(tempMax - tempMin) * extraTerrestrialRadiationAsEnergy;
            solarRadiationForAClearDay = (0.75 + 2 * (height / 100000)) * extraTerrestrialRadiationAsEnergy;
            relraIrsO = incidentSolarRadiation / solarRadiationForAClearDay;
            netShortwaveSolarRadiation = (1 - ALBEDO_CONSTANT) * incidentSolarRadiation;
            netLongwaveSolarRadiation = getIsothermalLongwaveRadiationFactor(tempMax, tempMin) * getHumidityFactor(realVaporPressureAtAvgRelativeHumidity) * getCloudFactor(relraIrsO);
            netSolarRadiation = netShortwaveSolarRadiation - netLongwaveSolarRadiation;
            aerodynamicResistance = (208 / getWindSpeedAsMtsPerSecond(windSpeed, windSpeedMeasurementHeight)) / 86400;
            referenceCropSurfaceResistance = REFERENCE_CROP_SURFACE_RESISTANCE_CONSTANT / 86400;

            evapotranspirationRadiationTerm = ((getSlopeVaporPressureCurve(tempAvg) * netSolarRadiation) / (getSlopeVaporPressureCurve(tempAvg) + getPsychrometricConstant(height, tempAvg) * (1 + referenceCropSurfaceResistance / aerodynamicResistance))) / getLatentHeatEvaporation(tempAvg);
            aerodynamicEvapotranspirationRadiationTerm = (getPsychrometricConstant(height, tempAvg) / (getSlopeVaporPressureCurve(tempAvg) + getPsychrometricConstant(height, tempAvg) * (1 + referenceCropSurfaceResistance / aerodynamicResistance))) * (900.0 / (tempAvg + 273)) * getWindSpeedAsMtsPerSecond(windSpeed, windSpeedMeasurementHeight) * vaporPressureDeficitAtAvgTemp;
            evapotranspirationReferencePenmanMontiehtFAO56 = evapotranspirationRadiationTerm + aerodynamicEvapotranspirationRadiationTerm;
            evapotranspirationReferenceHargreaves = 0.0023 * (tempAvg + 17.8) * Math.Pow((tempMax - tempMin), 0.5) * extraTerrestrialRadiationAsWater;

            output.TempMin = tempMin;
            output.TempMax = tempMax;
            output.TempAvg = tempAvg;
            output.RelativeHumidtyMin = relativeHumidityMin;
            output.RelativeHumidtyMax = relativeHumidityMax;
            output.RelativeHumidtyAvg = relativeHumidityAvg;
            output.Date = date;
            output.LatitudeInGrades = latitudeGrades;
            output.LatitudeInMinutes = latitudeMinutes;
            output.Height = height;
            output.WindSpeed = windSpeed;
            output.WindSpeedMeasurementHeight = windSpeedMeasurementHeight;

            output.SaturationVaporPressureAtMaxTemp = saturationVaporPressureAtMaxTemp;
            output.SaturationVaporPressureAtMinTemp = saturationVaporPressureAtMinTemp;
            output.SaturationVaporPressureAtAvgTemp = saturationVaporPressureAtAvgTemp;
            output.RealVaporPressureAtMaxRelativeHumidity = realVaporPressureAtMaxRelativeHumidity;
            output.RealVaporPressureAtMinRelativeHumidity = realVaporPressureAtMinRelativeHumidity;
            output.RealVaporPressureAtAvgRelativeHumidity = realVaporPressureAtAvgRelativeHumidity;
            output.VaporPressureDeficitAtMaxTemp = vaporPressureDeficitAtMaxTemp;
            output.VaporPressureDeficitAtMimTemp = vaporPressureDeficitAtMimTemp;
            output.VaporPressureDeficitAtAvgTemp = vaporPressureDeficitAtAvgTemp;
            output.ExtraTerrestrialRadiationAsEnergy = extraTerrestrialRadiationAsEnergy;
            output.ExtraTerrestrialRadiationAsWater = extraTerrestrialRadiationAsWater;
            output.IncidentSolarRadiation = incidentSolarRadiation;
            output.SolarRadiationForAClearDay = solarRadiationForAClearDay;
            output.NetShortwaveSolarRadiation = netShortwaveSolarRadiation;
            output.NetLongwaveSolarRadiation = netLongwaveSolarRadiation;
            output.NetSolarRadiation = netSolarRadiation;
            output.AerodynamicResistance = aerodynamicResistance;
            output.ReferenceCropSurfaceResistance = referenceCropSurfaceResistance;
            output.EvapotranspirationRadiationTerm = evapotranspirationRadiationTerm;
            output.AerodynamicEvapotranspirationRadiationTerm = aerodynamicEvapotranspirationRadiationTerm;
            output.EvapotranspirationReferencePenmanMontiehtFAO56 = evapotranspirationReferencePenmanMontiehtFAO56;
            output.EvapotranspirationReferenceHargreaves = evapotranspirationReferenceHargreaves;

            return output;
        }
    }
}
