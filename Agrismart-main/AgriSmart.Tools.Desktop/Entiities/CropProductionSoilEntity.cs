using AgriSmart.Core.Entities;
using AgriSmart.Tools.DataModels;
using System;
using System.Collections.Generic;

namespace AgriSmart.Tools.Entities
{
    public class CropProductionSoilEntity : CropProductionEntity
    {
        public List<SoilLayerEntity> SoilLayers { get; set; }
        public double NumberOfDropperM2 { get; set; }//fill by IrrigationDesing Tool
        public CropProductionSoilEntity()
        {
        }
        public CropProductionSoilEntity(int id)
        {
            this.Id = id;
        }

        public CropProductionSoilEntity(CropProductionSoilModel model)
        {
            this.CopyPropertiesFrom(model);
        }
        public CropProductionSoilEntity(CropProduction cropProductionModel, ProductionUnitEntity productionUnit, CropEntity crop, ContainerEntity container, GrowingMediumEntity growingMedium)
        {
            Id = cropProductionModel.Id;
            Name = cropProductionModel.Name;
            ProductionUnit = productionUnit;
            Length = cropProductionModel.Length;
            Crop = crop;
            Width = cropProductionModel.Width;
            BetweenRowDistance = cropProductionModel.BetweenRowDistance;
            BetweenPlantDistance = cropProductionModel.BetweenPlantDistance;
            StartDate = cropProductionModel.StartDate;
        }

        private double getDensityPlant()
        {
            return 1 / (BetweenRowDistance * BetweenPlantDistance);
        }
        private double getTotalPlants()
        {
            return DensityPlant * Area;
        }
        private int getNumberOfRows()
        {
            return Convert.ToInt32(Math.Round((Width / BetweenRowDistance),0));
        }
        private int getNumberOfDroppers()
        {
            return Convert.ToInt32(NumberOfDropperM2 * Area);
        }
    }
}
