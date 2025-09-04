using AgriSmart.Core.Entities;
using System;
using System.Collections.Generic;

namespace AgriSmart.Tools.Entities
{
    public class CropProductionEntity : BaseEntity
    {
        public CropEntity Crop { get; set; }

        public ProductionUnitEntity ProductionUnit;
        public double Length { get; set; }
        public double Width { get; set; }
        public double Area { get { return getArea(); } }
        public double BetweenRowDistance { get; set; }
        public double BetweenPlantDistance { get; set; }
        public DropperEntity Dropper { get; set; } = new DropperEntity("Goterio Nandanyan", 2);
        public DateTime StartDate { get; set; }
        public List<CropProductionIrrigationSectorEntity> IrrigationSector { get; set; }

        //Methods
        public double DensityPlant { get { return getDensityPlant(); } }
        public double TotalPlants { get { return getTotalPlants(); } }
        public int NumberOfRows { get { return getNumberOfRows(); } }
        public int NumberOfPlantsPerRow { get { return getNumberOfPlantsPerRow(); } }
        public double DepletionPercentage { get; set; } = 10;
        public double DrainThreshold { get; set; } = 15;
        public double StopDrainPercentage { get; set; } = 15;

        public CropProductionEntity()
        {
        }
        public CropProductionEntity(int id)
        {
            this.Id = id;
        }
        public CropProductionEntity(CropProduction cropProductionModel, ProductionUnitEntity productionUnit, CropEntity crop, ContainerEntity container, GrowingMediumEntity growingMedium)
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

        private double getArea()
        {
            return Length * Width;
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
        private int getNumberOfPlantsPerRow()
        {
            return 0;
        }

    }
}
