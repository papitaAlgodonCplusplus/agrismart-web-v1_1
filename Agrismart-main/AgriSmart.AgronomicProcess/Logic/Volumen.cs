namespace AgriSmart.AgronomicProcess.Logic
{
    public class Volume
    {
        public enum volumeMeasure { none, toLitre, toCubicMetre }

        private double value = 0;

        public volumeMeasure VolumeMeasureType { get; set; }

        public Volume()
        {

        }

        public Volume(double value, volumeMeasure measure)
        {
            this.value = value;
            this.VolumeMeasureType = measure;
        }

        public double Value
        {
            get
            {
                return getVolume();
            }
        }

        public double getVolume()
        {
            switch (VolumeMeasureType)
            {
                case volumeMeasure.none:
                    {
                        return value;
                    }
                case volumeMeasure.toLitre:
                    {
                        return value / 1000;
                    }

                case volumeMeasure.toCubicMetre:
                    {
                        return value / 1000000;
                    }

                default: return 0;
            }
        }
    }
}
