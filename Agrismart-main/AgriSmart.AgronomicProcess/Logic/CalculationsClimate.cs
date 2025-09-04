using AgriSmart.AgronomicProcess.Entities;
using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Logic
{
    public class CalculationsClimate
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
            return 1 + EARTH_SUN_INVERSE_DISTANCE_CONSTANT * Math.Cos(2 * Math.PI / getNDays(date) * date.DayOfYear);
        }

        private static double getLatitudeInRadians(double latitudeGrades, double latitudeMinutes)
        {
            return Math.PI / 180 * (latitudeGrades + latitudeMinutes / 60);
        }

        private static double getSolarInclination(DateTime date)
        {
            return 0.409 * Math.Sin(2 * Math.PI / getNDays(date) * date.DayOfYear - 1.39);
        }

        private static double getSolarSunsetAngle(DateTime date, double latitudeGrades, double latitudeMinutes)
        {
            return Math.Acos(Math.Tan(getLatitudeInRadians(latitudeGrades, latitudeMinutes) * -1) * Math.Tan(getSolarInclination(date)));
        }

        private static double getExtraterrestrialSolarRadiationTerm(DateTime date, double latitudeGrades, double latitudeMinutes)
        {
            return getSolarSunsetAngle(date, latitudeGrades, latitudeMinutes) * Math.Sin(getLatitudeInRadians(latitudeGrades, latitudeMinutes)) * Math.Sin(getSolarInclination(date) + Math.Cos(getLatitudeInRadians(latitudeGrades, latitudeMinutes) * Math.Cos(getSolarInclination(date)) * Math.Sin(getSolarSunsetAngle(date, latitudeGrades, latitudeMinutes))));
        }

        private static double getIsothermalLongwaveRadiationFactor(double tempMax, double tempMin)
        {
            return STEFANBOLTZMANN_CONSTANT * ((Math.Pow(tempMax + 273.16, 4) + Math.Pow(tempMin + 273.16, 4)) / 2);
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
            return windSpeed * (1000.0 / 3600.0) * (4.87 / Math.Log(67.8 * windSpeedMeasurementHeight - 5.42));
        }

        private static double getSlopeVaporPressureCurve(double tempAvg)
        {
            return 4098 * getSaturationVaporPressure(tempAvg) / Math.Pow(tempAvg + 237.3, 2);
        }

        private static double getLatentHeatEvaporation(double tempAvg)
        {
            return 2.501 - 2.361 * Math.Pow(10, -3) * tempAvg;
        }

        private static double getPsychrometricConstant(int height, double tempAverage)
        {
            double p = 101.3 * Math.Pow((293 - 0.0065 * height) / 293, 5.26);
            return p * (SPECIFIC_HEAT_AT_CONSTANT_PRESSURE_CONSTANT / (MOLECULAR_WEIGHT_RATIO_OF_WATER_VAPOR_DRY_AIR * getLatentHeatEvaporation(tempAverage)));
        }

        private static double getDegreesDay(double tempMax, double tempMin, double cropBaseTemperature)
        {
            return tempMax + tempMin / 2 - cropBaseTemperature;
        }

        //private static double getLightIntegralPAR(ClimateMeasurementEntity climateMeasurementEntity, double tempMax, double tempMin, double cropBaseTemperature)
        //{
        //    return climateMeasurementEntity.PhotosyntheticallyActiveRadiationAvg * 0.0036;
        //}

        //private static double getLightIntegralGlobal(ClimateMeasurementEntity climateMeasurementEntity, double tempMax, double tempMin, double cropBaseTemperature)
        //{
        //    return climateMeasurementEntity.TotalSolarRadiationAvg * 0.0036;
        //}


        public static KPIsOutput Calculate(DateTime date, List<MeasurementVariable> measurementVariables, List<Measurement> climateMeasurements, CropProductionEntity cropProduction)
        {
            double tempMin = 0;
            double tempMax = 0;
            double tempAvg = 0;

            double humMin = 0;
            double humMax = 0;
            double humAvg = 0;

            double saturationVaporPressureAtMaxTemp = 0;
            double saturationVaporPressureAtMinTemp = 0;
            double saturationVaporPressureAtAvgTemp = 0;
            double realVaporPressureAtMaxRelativeHumidity = 0;
            double realVaporPressureAtMinRelativeHumidity = 0;
            double realVaporPressureAtAvgRelativeHumidity = 0;
            double vaporPressureDeficitAtMaxTemp = 0;
            double vaporPressureDeficitAtMimTemp = 0;
            double vaporPressureDeficitAtAvgTemp = 0;
            double extraTerrestrialRadiationAsEnergy = 0;
            double extraTerrestrialRadiationAsWater = 0;
            double incidentSolarRadiation = 0;
            double solarRadiationForAClearDay = 0;
            double netShortwaveSolarRadiation = 0;
            double netLongwaveSolarRadiation = 0;
            double netSolarRadiation = 0;
            double aerodynamicResistance = 0;
            double referenceCropSurfaceResistance = 0;
            double evapotranspirationRadiationTerm = 0;
            double aerodynamicEvapotranspirationRadiationTerm = 0;
            double evapotranspirationReferencePenmanMontiehtFAO56 = 0;
            double evapotranspirationReferenceHargreaves = 0;
            double relraIrsO;
            double LightIntegralPAR = 0;
            double LightIntegralGlobal = 0;

            KPIsOutput output = new KPIsOutput();

            MeasurementVariable measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 5).FirstOrDefault();
            List<Measurement> tempMeasurement = climateMeasurements.Where(x => x.MeasurementVariableId == measurementVariable.Id).ToList();

            if (tempMeasurement.Count > 0)
            {
                tempMin = tempMeasurement.Min(x => x.MinValue);
                tempMax = tempMeasurement.Max(x => x.MaxValue);
                tempAvg = tempMeasurement.Average(x => x.AvgValue);

                saturationVaporPressureAtMinTemp = getSaturationVaporPressure(tempMin);
                saturationVaporPressureAtMaxTemp = getSaturationVaporPressure(tempMax);
                saturationVaporPressureAtAvgTemp = getSaturationVaporPressure(tempAvg);

                output.SaturationVaporPressureAtMinTemp = saturationVaporPressureAtMinTemp;
                output.SaturationVaporPressureAtMaxTemp = saturationVaporPressureAtMaxTemp;
                output.SaturationVaporPressureAtAvgTemp = saturationVaporPressureAtAvgTemp;

                output.TempMin = tempMin;
                output.TempMax = tempMax;
                output.TempAvg = tempAvg;
            }

            measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 6).FirstOrDefault();
            List<Measurement> humMeasurements = climateMeasurements.Where(x => x.MeasurementVariableId == measurementVariable.Id).ToList();

            if (humMeasurements.Count > 0 && tempMeasurement.Count > 0)
            {
                humMin = humMeasurements.Min(x => x.MinValue);
                humMax = humMeasurements.Max(x => x.MaxValue);
                humAvg = humMeasurements.Average(x => x.AvgValue);

                realVaporPressureAtMaxRelativeHumidity = saturationVaporPressureAtMinTemp * humMin / 100;
                realVaporPressureAtMinRelativeHumidity = saturationVaporPressureAtMaxTemp * humMax / 100;
                realVaporPressureAtAvgRelativeHumidity = saturationVaporPressureAtAvgTemp * humAvg / 100;

                vaporPressureDeficitAtMaxTemp = saturationVaporPressureAtMaxTemp - realVaporPressureAtMaxRelativeHumidity;
                vaporPressureDeficitAtMimTemp = saturationVaporPressureAtMinTemp - realVaporPressureAtMinRelativeHumidity;
                vaporPressureDeficitAtAvgTemp = saturationVaporPressureAtAvgTemp - realVaporPressureAtAvgRelativeHumidity;
                extraTerrestrialRadiationAsEnergy = SOLAR_CONSTANT * getEarthSunInverseDistance(date) * getExtraterrestrialSolarRadiationTerm(date, cropProduction.LatitudeGrades, cropProduction.LatitudeMinutes);
                incidentSolarRadiation = 0.178 * (tempMax - tempMin) * extraTerrestrialRadiationAsEnergy;
                solarRadiationForAClearDay = (0.75 + 2 * (cropProduction.Altitude / 100000)) * extraTerrestrialRadiationAsEnergy;
                relraIrsO = incidentSolarRadiation / solarRadiationForAClearDay;
                netShortwaveSolarRadiation = (1 - ALBEDO_CONSTANT) * incidentSolarRadiation;
                netLongwaveSolarRadiation = getIsothermalLongwaveRadiationFactor(tempMax, tempMin) * getHumidityFactor(realVaporPressureAtAvgRelativeHumidity) * getCloudFactor(relraIrsO);
                netSolarRadiation = netShortwaveSolarRadiation - netLongwaveSolarRadiation;
                evapotranspirationRadiationTerm = getSlopeVaporPressureCurve(tempAvg) * netSolarRadiation / (getSlopeVaporPressureCurve(tempAvg) + getPsychrometricConstant(cropProduction.Altitude, tempAvg) * (1 + referenceCropSurfaceResistance / aerodynamicResistance)) / getLatentHeatEvaporation(tempAvg);

                output.RelativeHumidtyMin = humMin;
                output.RelativeHumidtyMax = humMax;
                output.RelativeHumidtyAvg = humAvg;
            }

            measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 8).FirstOrDefault();
            List<Measurement> windSpeedMeasurements = climateMeasurements.Where(x => x.MeasurementVariableId == measurementVariable.Id).ToList();

            if (windSpeedMeasurements.Count > 0)
            {
                double winSpeedAvg = windSpeedMeasurements.Average(x => x.AvgValue);
                output.WindSpeed = winSpeedAvg;

                aerodynamicResistance = 208 / getWindSpeedAsMtsPerSecond(winSpeedAvg, cropProduction.WindSpeedMeasurementHeight) / 86400;
                referenceCropSurfaceResistance = REFERENCE_CROP_SURFACE_RESISTANCE_CONSTANT / 86400;

                aerodynamicEvapotranspirationRadiationTerm = getPsychrometricConstant(cropProduction.Altitude, tempAvg) / (getSlopeVaporPressureCurve(tempAvg) + getPsychrometricConstant(cropProduction.Altitude, tempAvg) * (1 + referenceCropSurfaceResistance / aerodynamicResistance)) * (900.0 / (tempAvg + 273)) * getWindSpeedAsMtsPerSecond(winSpeedAvg, cropProduction.WindSpeedMeasurementHeight) * vaporPressureDeficitAtAvgTemp;
                evapotranspirationReferencePenmanMontiehtFAO56 = evapotranspirationRadiationTerm + aerodynamicEvapotranspirationRadiationTerm;
                evapotranspirationReferenceHargreaves = 0.0023 * (tempAvg + 17.8) * Math.Pow(tempMax - tempMin, 0.5) * extraTerrestrialRadiationAsWater;

            }

            measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 7).FirstOrDefault();
            List<Measurement> parMeasurement = climateMeasurements.Where(x => x.MeasurementVariableId == measurementVariable.Id).ToList();

            if (parMeasurement.Count > 0)
            {
                double radAvg = parMeasurement.Average(x => x.AvgValue);
                LightIntegralPAR = radAvg * 0.0036;
            }

            measurementVariable = measurementVariables.Where(x => x.MeasurementVariableStandardId == 4).FirstOrDefault();
            List<Measurement> radMeasurements = climateMeasurements.Where(x => x.MeasurementVariableId == measurementVariable.Id).ToList();

            if (radMeasurements.Count > 0)
            {
                double radAvg = radMeasurements.Average(x => x.AvgValue);
                LightIntegralGlobal = radAvg * 0.0036;
            }



            output.Date = date;
            output.LatitudeInGrades = cropProduction.LatitudeGrades;
            output.LatitudeInMinutes = cropProduction.LatitudeMinutes;
            output.Altitude = cropProduction.Altitude;
            output.WindSpeedMeasurementHeight = cropProduction.WindSpeedMeasurementHeight;


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
            output.LightIntegralPAR = LightIntegralPAR;
            output.LightIntegralGlobal = LightIntegralGlobal;
            return output;
        }
    }
}
