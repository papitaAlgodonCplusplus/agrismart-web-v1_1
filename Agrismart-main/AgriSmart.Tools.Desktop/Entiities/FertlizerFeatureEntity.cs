using System;

namespace AgriSmart.Tools.Entities
{
    public class FertlizerFeatureEntity : IComparable<FertlizerFeatureEntity>
    {
        public string FeatureName { get; set; }
        public double Value { get; set; }
        public FertlizerFeatureEntity BaseFertilizerFeature { get; set; }
        public FertilizerEntity Fertilizer { get; set; }

        public FertlizerFeatureEntity()
        {
        }

        public FertlizerFeatureEntity   (string featureName)
        {
            this.FeatureName = featureName;
        }


        public FertlizerFeatureEntity(string featureName, double value)
        {
            this.FeatureName = featureName;
            this.Value = value;
        }

        public override bool Equals(object obj)
        {
            if (obj == null) return false;
            if (this.GetType() != obj.GetType()) return false;
            FertlizerFeatureEntity otherFeature = (FertlizerFeatureEntity)obj;
            if (!otherFeature.FeatureName.Equals(this.FeatureName))
                return false;
            return true;
        }

        public override int GetHashCode()
        {
            return this.FeatureName.GetHashCode();
        }

        public int CompareTo(FertlizerFeatureEntity other)
        {
            if (other != null)
            {
                return this.FeatureName.CompareTo(other.FeatureName);
            }
            return 1;
        }

    }
}
