using AgriSmart.Tools.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools
{
    public class BalanceMaster
    {
        public string ItemName { get; set; }
        public string Caption { get; set; }
        public double Amount { get; set; }
        public double HCO3 { get { return getSum(s => s.HCO3); }}
        public double HCO3_p { get { return getSum(s => s.HCO3_p); } }
        public double NO3 { get { return getSum(s => s.NO3); } }
        public double NO3_p { get { return getSum(s => s.NO3_p); } }
        public double H2PO4 { get { return getSum(s => s.H2PO4); } }
        public double H2PO4_p { get { return getSum(s => s.H2PO4_p); } }
        public double SO4 { get { return getSum(s => s.SO4); } }
        public double SO4_p { get { return getSum(s => s.SO4_p); } }
        public double K { get { return getSum(s => s.K); } }
        public double K_p { get { return getSum(s => s.K_p); } }
        public double Cl { get { return getSum(s => s.Cl); } }
        public double Cl_p { get { return getSum(s => s.Cl_p); } }
        public double Ca { get { return getSum(s => s.Ca); } }
        public double Ca_p { get { return getSum(s => s.Ca_p); } }
        public double Mg { get { return getSum(s => s.Mg); } }
        public double Mg_p { get { return getSum(s => s.Mg_p); } }
        public double Na { get { return getSum(s => s.Na); } }
        public double Na_p { get { return getSum(s => s.Na_p); } }
        public double Fe { get { return getSum(s => s.Fe); } }
        public double Fe_p { get { return getSum(s => s.Fe_p); } }
        public double B { get { return getSum(s => s.B); } }
        public double B_p { get { return getSum(s => s.B_p); } }
        public double Cu { get { return getSum(s => s.Cu); } }
        public double Cu_p { get { return getSum(s => s.Cu_p); } }
        public double Zn { get { return getSum(s => s.Zn); } }
        public double Zn_p { get { return getSum(s => s.Zn_p); } }
        public double Mn { get { return getSum(s => s.Mn); } }
        public double Mn_p { get { return getSum(s => s.Mn_p); } }
        public double Mo { get { return getSum(s => s.Mo); } }
        public double Mo_p { get { return getSum(s => s.Mo_p); } }
        public double N { get { return getSum(s => s.N); } }
        public double N_p { get { return getSum(s => s.N_p); } }
        public double S { get { return getSum(s => s.S); } }
        public double S_p { get { return getSum(s => s.S_p); } }
        public double P { get { return getSum(s => s.P); } }
        public double P_p { get { return getSum(s => s.P_p); } }

        public List<BalanceDetail> BalanceDetails { get; set; }


        public double getSum(Func<BalanceDetail, double> accessor)
        {
            return BalanceDetails.Sum(accessor);
        }

        public void AddBalanceDetail(BalanceDetail detail)
        {
            if (BalanceDetails == null)
                BalanceDetails = new List<BalanceDetail>();

            BalanceDetails.Add(detail);
        }
    }
}
