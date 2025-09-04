using AgriSmart.Core;
using System;
using System.ComponentModel;

namespace AgriSmart.Tools.Entities
{
    public enum containerType { conicalContainer =1, cylinderContainer =2, cubicContainer =3  };

    public class ContainerEntity: BaseEntity
    {
        public int CatalogId { get; set; }
        public containerType ContainerType { get; set; }
        public double Height { get; set; }
        public double Width { get; set; }
        public double Length { get; set; }
        public double LowerDiameter { get; set; }
        public double UpperDiameter { get; set; }

        public Volume Volume { get { return getVolume(); } }
        private Volume.volumeMeasure measureType;

        public ContainerEntity()
        {
        }

        public ContainerEntity(containerType type, double height, double width, double length, double lowerDiameter, double upperDiameter, Volume.volumeMeasure measure)
        {
            ContainerType = type;
            Height = height;
            UpperDiameter = lowerDiameter;
            UpperDiameter = upperDiameter;
            Width = width;
            Length = length;
            measureType = measure;
        }

        public ContainerEntity(AgriSmart.Core.Entities.Container model)
        {
            Id = model.Id;
            containerType type;
            Enum.TryParse(model.ContainerTypeId.ToString(), out type);
            ContainerType = type;
            Name = model.Name;
            Height = model.Height;
            UpperDiameter = model.LowerDiameter;
            UpperDiameter = model.UpperDiameter;
            Width = model.Width;
            Length = model.Length;
            measureType = Volume.volumeMeasure.none;
        }



        private Volume getVolume()
        {
            double value = 0;

            switch (ContainerType)
            {
                case containerType.conicalContainer:
                    {
                        double lowerRadium = LowerDiameter / 2;
                        double upperRadium = UpperDiameter / 2;
                        double lowerArea = Math.Pow(LowerDiameter, 2) * Math.PI;
                        double upperArea = Math.Pow(UpperDiameter, 2) * Math.PI;

                        value =  1/3 * (lowerArea + upperArea + Math.Sqrt(lowerArea * upperArea)) * Height;

                        break;
                    }
                case containerType.cubicContainer:
                    {
                        value = Height * Length * Width;
                        break;
                    }
                case containerType.cylinderContainer:
                    {
                        value = Math.PI * Math.Pow((UpperDiameter / 2), 2) * Height;
                        break;
                    }
            }

            return new Volume(value, measureType);
        }

    }
}
