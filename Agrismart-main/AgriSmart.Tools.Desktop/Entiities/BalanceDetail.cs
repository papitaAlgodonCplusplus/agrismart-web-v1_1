using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.Entities
{
    public class BalanceDetail
    {
        public BalanceMaster RequirementMaster { get; set; }
        public BalanceMaster SupplyMaster { get; set;}
        public string ParentName { get; set; }
        public string ItemName { get; set; }
        public Int64 SourceId { get; set; }
        public string Caption { get; set; }
        public double Amount { get; set; } = 0;
        public double HCO3 { get; set; } = 0;
        public double HCO3_p { get { return getPercentage("HCO3"); } }
        public double NO3 { get; set; } = 0;
        public double NO3_p { get { return getPercentage("NO3"); } }
        public double H2PO4 { get; set; } = 0;
        public double H2PO4_p { get { return getPercentage("H2PO4"); } }
        public double SO4 { get; set; } = 0;
        public double SO4_p { get { return getPercentage("SO4"); } }
        public double K { get; set; } = 0;
        public double K_p { get { return getPercentage("K"); } }
        public double Cl { get; set; } = 0;
        public double Cl_p { get { return getPercentage("Cl"); } }
        public double Ca { get; set; } = 0;
        public double Ca_p { get { return getPercentage("Ca"); } }
        public double Mg { get; set; } = 0;
        public double Mg_p { get { return getPercentage("Mg"); } }
        public double Na { get; set; } = 0;
        public double Na_p { get { return getPercentage("Na"); } }
        public double Fe { get; set; } = 0;
        public double Fe_p { get { return getPercentage("Fe"); } }
        public double B { get; set; } = 0;
        public double B_p { get { return getPercentage("B"); } }
        public double Cu { get; set; } = 0;
        public double Cu_p { get { return getPercentage("Cu"); } }
        public double Zn { get; set; } = 0;
        public double Zn_p { get { return getPercentage("Zn"); } }
        public double Mn { get; set; } = 0;
        public double Mn_p { get { return getPercentage("Mn"); } }
        public double Mo { get; set; } = 0;
        public double Mo_p { get { return getPercentage("Mo"); } }
        public double N { get; set; } = 0;
        public double N_p { get { return getPercentage("N"); } }
        public double S { get; set; } = 0;
        public double S_p { get { return getPercentage("S"); } }
        public double P { get; set; } = 0;
        public double P_p { get { return getPercentage("P"); } }
        private double getPercentage(string propName)
        {
            double parentValue = (double)getPropValue(RequirementMaster, propName);
            double value = (double)getPropValue(this, propName);

            if (value != 0)
                return value / parentValue * 100;
            else
                return 0;
        }
        private object getPropValue(object parent, string propName)
        {
            return parent.GetType().GetProperty(propName).GetValue(parent, null);
        }
    }
}
