namespace AgriSmart.Tools.Entities
{
    public class SolutionFeature
    {
        private enum source { Balancer, WaterChemistry}; 
        private WaterChemistryEntity waterChemistry;
        private Balancer balancer;

        public string Name { get; set; }
        public string Caption { get; set; }
        public string DisplayName { get; set; }
        public double Value { get { return getValue(); }}
        public string Unit { get; set; }
        public string Interpretation { get { return getIntepretation(); } }
        public int Index { get; set; }
        public string FormatString { get; set; }
        public bool Visible { get; set; }
        public string CategoryName { get; set; }
        public SolutionFeatureCategory Category { get; set; }
        public string MethodName { get; set; }
        public string FeatureName { get; set; }
        public string Rule { get; set; }
        private source Source;


        public SolutionFeature(SolutionFeatureInfo feature, Balancer balancer)
        {
            this.balancer = balancer;
            Name = feature.Name;
            Caption = feature.Caption;
            DisplayName = feature.DisplayName;
            Index = feature.Index;
            FormatString = feature.FormatString;
            Visible = feature.Visible;
            CategoryName = feature.CategoryName;
            MethodName = feature.MethodName;
            FeatureName = feature.FeatureName;
            Unit = feature.Unit;
            Rule = feature.Rule;
            Source = source.Balancer;
        }

        public SolutionFeature(SolutionFeatureInfo feature, WaterChemistryEntity waterChemistry)
        {
            this.waterChemistry = waterChemistry;
            Name = feature.Name;
            Caption = feature.Caption;
            DisplayName = feature.DisplayName;
            Index = feature.Index;
            FormatString = feature.FormatString;
            Visible = feature.Visible;
            CategoryName = feature.CategoryName;
            MethodName = feature.MethodName;
            FeatureName = feature.FeatureName;
            Unit = feature.Unit;
            Rule = feature.Rule;
            Source = source.WaterChemistry;
        }

        private double getValue()
        {
            if (FeatureName != "")
            {
                switch (Source)
                {
                    case source.WaterChemistry: return waterChemistry.GetValueFromFeature(FeatureName);
                    case source.Balancer: return balancer.GetValueFromFeature(FeatureName);
                }
            }

            if (MethodName != "")
            {
                switch (Source)
                {
                    case source.WaterChemistry: return waterChemistry.GetValueFromMethod(MethodName);
                    case source.Balancer: return balancer.GetValueFromMethod(MethodName);
                }
            }

            return 0;
        }   

        public string getIntepretation()
        {
            System.Data.DataTable table = new System.Data.DataTable();

            string ruleToApply = Rule.Replace("val", Value.ToString());

            if (ruleToApply != string.Empty)
            {
                table.Columns.Clear();
                table.Columns.Add("", typeof(string));
                table.Columns[0].Expression = ruleToApply;

                System.Data.DataRow r = table.NewRow();
                table.Rows.Add(r);
                return (string)r[0];
            }
            else
                return "";
        }

    }
}
