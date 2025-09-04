using System.Collections.Generic;

namespace AgriSmart.Tools.Entities
{
    public class ElementBreakdown
    {
        public Dictionary<string, double> MolecularWeightDic = new Dictionary<string, double> {
            {"N",14.0067},
            {"P",30.9738},
            {"K",39.0980},
            {"Ca",40.080},
            {"Mg",24.305},
            {"S",32.064},
            {"B",10.810},
            {"Cu",63.540},
            {"Fe",55.847},
            {"Mn",54.938},
            {"Mo",95.940},
            {"Zn",65.370},
            {"Cl",35.453},
            {"Na",22.9898},
            {"C",12.01115},
            {"H",1.0080},
            {"O",15.9994},
            {"Si",28086}
        };

        public BaseElement Element { get; set; }
        public int N { get; set; }

        public ElementBreakdown()
        { }

        public ElementBreakdown(BaseElement element, int n)
        {
            this.Element = element;
            this.N = n;
        }

        public double getMolecularWeight(string element)
        {
            double value;
            MolecularWeightDic.TryGetValue(element, out value);
            return value;
        }

    }
}
