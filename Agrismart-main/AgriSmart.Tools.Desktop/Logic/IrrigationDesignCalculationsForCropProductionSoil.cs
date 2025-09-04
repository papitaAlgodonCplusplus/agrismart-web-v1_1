using AgriSmart.Tools.Entities;
using AgriSmart.Tools.Logic;
using System;
using System.Collections.Generic;
using System.Linq;
using static AgriSmart.Tools.Common.Enums;

namespace AgriSmart.Tech.Calculations
{

    public class IrrigationDesignCalculationsForCropProductionSoil
    {
        IrrigationDesignCalculationsForCropProductionSoilInput input;

        CropProductionSoilEntity cropProduction;
        
        CalculationsETo calculationsETo = new CalculationsETo();

        Dictionary<Texture, double> WetStripWidthDic = new Dictionary<Texture, double> {
            { Texture.Clay,1.1},
            { Texture.ClayLoam,1.1},
            { Texture.SandyClayLoam,1},
            { Texture.SiltyClayLoam,1},
            { Texture.SandyClay,0.7},
            { Texture.SiltyClay,0.9},
            { Texture.Silt,0.9},
            { Texture.SiltLoam,0.9},
            { Texture.Sand,0.7},
            { Texture.LoamySand,0.75},
            { Texture.SandyLoam,0.8},
            { Texture.Loam,0.8},
            { Texture.UnClassified,0.9}
        };

        Dictionary<Texture, double> PercoletionEfficiencyDic = new Dictionary<Texture, double> {
            { Texture.Clay,1},
            { Texture.ClayLoam,1.025},
            { Texture.SandyClayLoam,1.04},
            { Texture.SiltyClayLoam, 1},
            { Texture.SandyClay,1.03},
            { Texture.SiltyClay,1},
            { Texture.Silt,1},
            { Texture.SiltLoam,1},
            { Texture.Sand,1.1},
            { Texture.LoamySand,1.08},
            { Texture.SandyLoam,1},
            { Texture.Loam,1},
            { Texture.UnClassified,1}
        };

        public double FieldCapacityPercentage { get { return getFieldCapacityPercentage(); } }
        public double TotalPorosityPercentage { get { return getTotalPorosityPercentage(); } }
        public double TotalPorosityVolume { get { return getTotalPorosityVolume(); } }
        public double SolidComponentPercentage { get { return getSolidComponentPercentage(); } }
        public double SolidComponentVolume { get { return getSolidComponentVolume(); } }
        public double EaselyAvailableWaterPercentage { get { return getEaselyAvailableWaterPercentage(); } }
        public double EaselyAvailableWaterVolumen { get { return getEaselyAvailableWaterVolume(); } }
        public double ReserveWaterPercentage { get { return getReserveWaterPercentage(); } }
        public double ReserveWaterVolumen { get { return getReserveWaterVolumen(); } }
        public double TotalAvailableWaterPercentage { get { return getTotalAvailableWaterPercentage(); } }
        public double TotalAvailableWaterVolume { get { return getTotalAvailableWaterVolumen(); } }
        public double NonAvailableWaterPercentage { get { return getNonAvailableWaterPercentage(); } }
        public double NonAvailableWaterVolume { get { return getTotalAvailableWaterVolumen(); } }
        public double AerationCapacityAtContainerCapacityPercentage { get { return getAerationCapacityAtContainerCapacityPercentage(); } }
        public double AerationCapacityAtContainerCapacityVolume { get { return getAerationCapacityAtContainerCapacityVolumen(); } }
        public double IrrigationSheetTotalVolume { get { return getIrrigationSheetTotalVolume(); } }
        public double IrrigationNetSheetVolume { get { return getIrrigationNetSheetVolume(); } }
        public double AdjustedETc { get { return getAdjustedETc(); } }
        public int NumberOfLaterals { get { return getNumberOfLaterals(); } }
        public double InterIrrigationInterval { get { return getInterIrrigationInterval(); } }
        public int IrrigationDuration { get { return getIrrigationDuration(); } }
        public IrrigationDesignCalculationsForCropProductionSoil(IrrigationDesignCalculationsForCropProductionSoilInput input)
        {
            this.input = input;
            this.cropProduction = input.cropProductionSoil;
        }

        private double getFieldCapacityPercentage()
        {
            return cropProduction.SoilLayers.Sum(x => (x.SoilDepth * x.FieldCapacityPercentage)) / cropProduction.SoilLayers.Sum(x => x.SoilDepth); ;
        }
        private double getTotalPorosityPercentage()
        {
            return cropProduction.SoilLayers.Sum(x => (x.SoilDepth * x.TotalPorosityPercentage)) / cropProduction.SoilLayers.Sum(x => x.SoilDepth);
        }
        private double getTotalPorosityVolume()
        {
            return cropProduction.SoilLayers.Sum(x => x.TotalPorosityVolume);
        }
        private double getSolidComponentPercentage()
        {
            return cropProduction.SoilLayers.Sum(x => (x.SoilDepth * x.SolidComponentPercentage)) / cropProduction.SoilLayers.Sum(x => x.SoilDepth);
        }
        private double getSolidComponentVolume()
        {
            return cropProduction.SoilLayers.Sum(x => x.SolidComponentVolume);
        }
        private double getEaselyAvailableWaterPercentage()
        {
            return cropProduction.SoilLayers.Average(x => (x.SoilDepth * x.EaselyAvaliableWaterPercentage)) / cropProduction.SoilLayers.Sum(x => x.SoilDepth);
        }
        private double getEaselyAvailableWaterVolume()
        {
            return cropProduction.SoilLayers.Sum(x => x.EaselyAvailableWaterVolumen);
        }
        private double getReserveWaterPercentage()
        {
            return cropProduction.SoilLayers.Sum(x => (x.SoilDepth * x.ReserveWaterPercentage)) / cropProduction.SoilLayers.Sum(x => x.SoilDepth);
        }
        private double getReserveWaterVolumen()
        {
            return cropProduction.SoilLayers.Sum(x => x.ReserveWaterVolumen);
        }
        private double getTotalAvailableWaterPercentage()
        {
            return cropProduction.SoilLayers.Sum(x => (x.SoilDepth * x.TotalAvailableWaterPercentage)) / cropProduction.SoilLayers.Sum(x => x.SoilDepth);
        }
        private double getTotalAvailableWaterVolumen()
        {
            return cropProduction.SoilLayers.Sum(x => x.TotalAvailableWaterVolume);
        }
        private double getNonAvailableWaterPercentage()
        {
            return cropProduction.SoilLayers.Sum(x => (x.SoilDepth * x.NonAvailableWaterPercentage)) / cropProduction.SoilLayers.Sum(x => x.SoilDepth);
        }
        private double getNonAvailableWaterVolume()
        {
            return cropProduction.SoilLayers.Sum(x => x.NonAvailableWaterVolume);
        }
        private double getAerationCapacityAtContainerCapacityPercentage()
        {
            return cropProduction.SoilLayers.Sum(x => (x.SoilDepth * x.AerationCapacityAtContainerCapacityPercentage)) / cropProduction.SoilLayers.Sum(x => x.SoilDepth);
        }
        private double getAerationCapacityAtContainerCapacityVolumen()
        {
            return cropProduction.SoilLayers.Sum(x => x.AerationCapacityAtContainerCapacityVolume);
        }
        private double getIrrigationSheetTotalVolume()
        {
            return cropProduction.SoilLayers.Sum(x => x.IrrigationSheetTotalVolume);
        }
        private double getIrrigationNetSheetVolume()
        {
            double applicationEfficiency = cropProduction.SoilLayers.Sum(x => (x.SoilDepth * x.ApplicationEfficiency)) / cropProduction.SoilLayers.Sum(x => x.SoilDepth);

            foreach (var layer in cropProduction.SoilLayers)
            {
                double par = 0;

                double wetStripWidth = WetStripWidthDic.GetValueOrDefault(layer.Texture);

                if (input.NumberOfIrrigationLateralsPerRow > 1)
                    par = 0; /// revisar procedimiento!!!!!!!!!!!!!!!!!!!!!!!
                else
                    par = wetStripWidth / input.cropProductionSoil.BetweenRowDistance;

                layer.IrrigationSheetNetVolume = layer.IrrigationSheetTotalVolume * (layer.DepletionPercentage / 100) * par;
            }

            double irrigationSheetNetVolumne = cropProduction.SoilLayers.Sum(x => x.IrrigationSheetNetVolume);

            return irrigationSheetNetVolumne = irrigationSheetNetVolumne * applicationEfficiency * input.IrrigationSystemEfficiency;
        }
        private void setApplicationEfficiencyByLayer()
        {
            foreach (var layer in cropProduction.SoilLayers)
            {
                double salinityEfficiency = 1 - (input.Water.Chemistry.EC / 2 * input.MaximumElectroconductivityAllowed);
                double percolationEfficiency = PercoletionEfficiencyDic.GetValueOrDefault(layer.Texture);

                if (percolationEfficiency > salinityEfficiency)
                {
                    layer.ApplicationEfficiency = input.UniformityCoefficient * salinityEfficiency;
                }
                else
                {
                    layer.ApplicationEfficiency = input.UniformityCoefficient * percolationEfficiency;
                }
                
            }
        }
        private double getAdjustedETc()
        {
            double applicationEfficiency =  cropProduction.SoilLayers.Sum(x => (x.SoilDepth * x.ApplicationEfficiency)) / cropProduction.SoilLayers.Sum(x => x.SoilDepth);

            EToOutput etooutput = CalculationsETo.Calculate(DateTime.Today, input.TempMax, input.TempMin, input.TempAvg, input.RelativeHumidityMax, input.RelativeHumidityMin, input.RelativeHumidityAvg, input.WindSpeed, input.WindSpeedMeasurementHeight, input.Height, input.LatitudeGrades, input.LatitudeMinutes);

            double eto = 0;

            if (input.EToReferenceMethod == EToReferenceMethod.Hargreaves)
                eto = etooutput.EvapotranspirationReferenceHargreaves;
            else
                eto = etooutput.EvapotranspirationReferencePenmanMontiehtFAO56;

            double etc =  eto * input.CropCoefficient;

            return etc * applicationEfficiency * input.IrrigationSystemEfficiency; 


        }
        private int getNumberOfLaterals()
        {
            return input.cropProductionSoil.NumberOfRows * input.NumberOfIrrigationLateralsPerRow;
        }
        private double getBetweenLateralsDistance()
        {
            double bld = 0;

            if (input.NumberOfIrrigationLateralsPerRow > 1)
                bld = 0;// revisar procedimiento
            else
                bld = input.cropProductionSoil.BetweenRowDistance;

            return bld;
        }
        private double getRequiredNumberOfDropperPerM2()
        {
            return 1 / input.BetweenDropperDistance * getBetweenLateralsDistance();
        }
        private double getPrecipitationFlowM2Hour()
        {
            return input.cropProductionSoil.Dropper.FlowRate / (getBetweenLateralsDistance() * input.BetweenDropperDistance);
        }
        private double getInterIrrigationInterval()
        {
            return IrrigationNetSheetVolume / getAdjustedETc();
        }
        private int getIrrigationDuration()
        {
            return Convert.ToInt32(Math.Floor(AdjustedETc / getPrecipitationFlowM2Hour()));
        }

    }

}
 